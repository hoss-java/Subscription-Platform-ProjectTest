package com.subscriptionapi.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("User Entity Integration Tests")
public class UserIntegrationTest {
    
    @Autowired
    private TestEntityManager entityManager;

    @Autowired(required = false)
    private Validator validator;

    private User user;
    private Role testRole;

    @TestConfiguration
    public static class ValidationTestConfig {
        @Bean
        public LocalValidatorFactoryBean validator() {
            return new LocalValidatorFactoryBean();
        }
    }    

    @BeforeEach
    public void setUp() {
        // Create test role
        testRole = Role.builder()
            .name(RoleType.CUSTOMER)
            .description("Customer role")
            .permissions(new HashSet<>())
            .users(new HashSet<>())
            .build();
        
        entityManager.persistAndFlush(testRole);
    }
    
    @ParameterizedTest
    @CsvSource({
        "john@example.com, password123, John, Doe, true",
        "jane@example.com, securePass456, Jane, Smith, true",
        "admin@example.com, adminPass789, Admin, User, false"
    })
    @DisplayName("Should persist user with valid data")
    public void testPersistUserWithValidData(String email, String password, String firstName, String lastName, Boolean isActive) {
        // Arrange
        Set<Role> roles = new HashSet<>();
        roles.add(testRole);
        
        user = User.builder()
            .email(email)
            .password(password)
            .firstName(firstName)
            .lastName(lastName)
            .isActive(isActive)
            .roles(roles)
            .build();
        
        // Act
        User persistedUser = entityManager.persistAndFlush(user);
        
        // Assert
        assertNotNull(persistedUser.getId());
        assertEquals(email, persistedUser.getEmail());
        assertEquals(firstName, persistedUser.getFirstName());
        assertEquals(lastName, persistedUser.getLastName());
        assertEquals(isActive, persistedUser.getIsActive());
        assertEquals(1, persistedUser.getRoles().size());
    }
  
    @ParameterizedTest
    @CsvSource({
        "john@example.com, password123, password456",
        "duplicate@test.com, pass1234, pass5678",
        "admin@company.com, secret123, secret456"
    })
    @DisplayName("Should fail when email is duplicate")
    public void testDuplicateEmailConstraint(String email, String password1, String password2) {
        // Arrange
        User user1 = User.builder()
            .email(email)
            .password(password1)
            .firstName("John")
            .lastName("Doe")
            .roles(new HashSet<>())
            .build();
        
        User user2 = User.builder()
            .email(email)
            .password(password2)
            .firstName("Jane")
            .lastName("Smith")
            .roles(new HashSet<>())
            .build();
        
        entityManager.persistAndFlush(user1);
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            entityManager.persistAndFlush(user2);
        });
    }
    
    @ParameterizedTest
    @MethodSource("provideInvalidUserData")
    @DisplayName("Should fail when required fields are null or invalid")
    public void testNullConstraints(User invalidUser, String expectedFieldPath) {
        // Act
        Set<ConstraintViolation<User>> violations = validator.validate(invalidUser);
        
        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getPropertyPath().toString().equals(expectedFieldPath)));
    }
    
    @ParameterizedTest
    @CsvSource({
        "John, Doe, Johnny, Smith",
        "Jane, Smith, Janet, Johnson",
        "Bob, Brown, Robert, Blue"
    })
    @DisplayName("Should update user successfully")
    public void testUpdateUser(String originalFirstName, String originalLastName, String newFirstName, String newLastName) {
        // Arrange
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName(originalFirstName)
            .lastName(originalLastName)
            .roles(new HashSet<>())
            .build();
        
        User persistedUser = entityManager.persistAndFlush(user);
        Long userId = persistedUser.getId();
        
        // Act
        persistedUser.setFirstName(newFirstName);
        persistedUser.setLastName(newLastName);
        entityManager.persistAndFlush(persistedUser);
        
        User updatedUser = entityManager.find(User.class, userId);
        
        // Assert
        assertEquals(newFirstName, updatedUser.getFirstName());
        assertEquals(newLastName, updatedUser.getLastName());
    }
    
    @ParameterizedTest
    @ValueSource(strings = {
        "user1@example.com",
        "user2@example.com",
        "user3@example.com"
    })
    @DisplayName("Should delete user successfully")
    public void testDeleteUser(String email) {
        // Arrange
        user = User.builder()
            .email(email)
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(new HashSet<>())
            .build();
        
        User persistedUser = entityManager.persistAndFlush(user);
        Long userId = persistedUser.getId();
        
        // Act
        entityManager.remove(persistedUser);
        entityManager.flush();
        
        User deletedUser = entityManager.find(User.class, userId);
        
        // Assert
        assertNull(deletedUser);
    }
    
    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2})
    @DisplayName("Should assign roles to user")
    public void testUserWithRoles(int roleCount) {
        // Arrange
        Set<Role> rolesToAssign = new HashSet<>();
        
        if (roleCount >= 1) {
            rolesToAssign.add(testRole);
        }
        
        if (roleCount >= 2) {
            Role adminRole = Role.builder()
                .name(RoleType.ADMIN)
                .description("Admin role")
                .permissions(new HashSet<>())
                .users(new HashSet<>())
                .build();
            entityManager.persistAndFlush(adminRole);
            rolesToAssign.add(adminRole);
        }
        
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(rolesToAssign)
            .build();
        
        // Act
        User persistedUser = entityManager.persistAndFlush(user);
        
        // Assert
        assertEquals(roleCount, persistedUser.getRoles().size());
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    @DisplayName("Should set timestamps on creation")
    public void testTimestampsOnCreation(Boolean isActive) {
        // Arrange
        LocalDateTime beforeCreation = LocalDateTime.now();
        
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .isActive(isActive)
            .roles(new HashSet<>())
            .build();
        
        // Act
        User persistedUser = entityManager.persistAndFlush(user);
        LocalDateTime afterCreation = LocalDateTime.now();
        
        // Assert
        assertNotNull(persistedUser.getCreatedAt());
        assertNotNull(persistedUser.getUpdatedAt());
        assertTrue(persistedUser.getCreatedAt().isAfter(beforeCreation.minusSeconds(1)));
        assertTrue(persistedUser.getCreatedAt().isBefore(afterCreation.plusSeconds(1)));
    }
    
    @ParameterizedTest
    @ValueSource(strings = {
        "invalid-email",
        "notanemail",
        "@nodomain.com"
    })
    @DisplayName("Should validate email format")
    public void testEmailFormatValidation(String invalidEmail) {
        // Arrange
        user = User.builder()
            .email(invalidEmail)
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(new HashSet<>())
            .build();
        
        // Act
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        
        // Assert
        assertFalse(violations.isEmpty(), 
            "Expected validation violations for invalid email: " + invalidEmail);
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Email should be valid")),
            "Expected email validation error message");
    }
    
    @ParameterizedTest
    @ValueSource(strings = {
        "pass",
        "12345",
        "abc",
        "x"
    })
    @DisplayName("Should validate password length")
    public void testPasswordLengthValidation(String shortPassword) {
        // Arrange
        user = User.builder()
            .email("john@example.com")
            .password(shortPassword)
            .firstName("John")
            .lastName("Doe")
            .roles(new HashSet<>())
            .build();
        
        // Act
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        
        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("at least 6 characters")));
    }
    
    @ParameterizedTest
    @ValueSource(strings = {
        "user1@example.com",
        "user2@example.com",
        "user3@example.com"
    })
    @DisplayName("Should initialize isActive as true by default")
    public void testIsActiveDefault(String email) {
        // Arrange & Act
        user = User.builder()
            .email(email)
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(new HashSet<>())
            .build();
        
        User persistedUser = entityManager.persistAndFlush(user);
        
        // Assert
        assertTrue(persistedUser.getIsActive());
    }

    // ==================== HELPER METHODS ====================

    private static Stream<org.junit.jupiter.params.provider.Arguments> provideInvalidUserData() {
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(
                User.builder()
                    .email(null)
                    .password("password123")
                    .firstName("John")
                    .lastName("Doe")
                    .roles(new HashSet<>())
                    .build(),
                "email"
            ),
            org.junit.jupiter.params.provider.Arguments.of(
                User.builder()
                    .email("john@example.com")
                    .password(null)
                    .firstName("John")
                    .lastName("Doe")
                    .roles(new HashSet<>())
                    .build(),
                "password"
            ),
            org.junit.jupiter.params.provider.Arguments.of(
                User.builder()
                    .email("john@example.com")
                    .password("password123")
                    .firstName(null)
                    .lastName("Doe")
                    .roles(new HashSet<>())
                    .build(),
                "firstName"
            )
        );
    }

    private Stream<org.junit.jupiter.params.provider.Arguments> provideRoleConfigurations() {
        Set<Role> singleRole = new HashSet<>();
        singleRole.add(testRole);
        
        Role adminRole = Role.builder()
            .name(RoleType.ADMIN)
            .description("Admin role")
            .permissions(new HashSet<>())
            .users(new HashSet<>())
            .build();
        
        entityManager.persistAndFlush(adminRole);
        
        Set<Role> multipleRoles = new HashSet<>();
        multipleRoles.add(testRole);
        multipleRoles.add(adminRole);
        
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(singleRole, 1),
            org.junit.jupiter.params.provider.Arguments.of(multipleRoles, 2)
        );
    }
}
