package com.subscriptionapi.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Entity Unit Tests")
public class UserUnitTest {
    
    private User user;
    private Validator validator;
    
    @Mock
    private Set<Role> mockRoles;
    
    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }
    
    // ===== Valid User Creation =====
    
    @Test
    @DisplayName("Should create user with valid data")
    public void testUserCreationWithValidData() {
        user = User.builder()
            .id(1L)
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .isActive(true)
            .roles(mockRoles)
            .build();
        
        assertEquals(1L, user.getId());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("password123", user.getPassword());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertTrue(user.getIsActive());
        assertEquals(mockRoles, user.getRoles());
    }
    
    // ===== Invalid Email Tests =====
    
    @ParameterizedTest
    @DisplayName("Should fail validation with invalid or blank email")
    @CsvSource({
        "not-an-email,      Email should be valid",
        "user@,             Email should be valid",
        "@domain.com,       Email should be valid",
        "'',                Email cannot be blank"
    })
    public void testUserInvalidEmail(String email, String expectedMessage) {
        user = User.builder()
            .id(1L)
            .email(email)
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(mockRoles)
            .build();
        
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        
        assertFalse(violations.isEmpty(), "Expected validation violations for email: " + email);
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains(expectedMessage)),
            "Expected message containing: " + expectedMessage);
    }
    
    // ===== Invalid Password Tests =====
    
    @ParameterizedTest
    @DisplayName("Should fail validation with invalid password")
    @CsvSource({
        "'',                Password cannot be blank",
        "pass,              Password must be at least 6 characters"
    })
    public void testUserInvalidPassword(String password, String expectedMessage) {
        user = User.builder()
            .id(1L)
            .email("john@example.com")
            .password(password)
            .firstName("John")
            .lastName("Doe")
            .roles(mockRoles)
            .build();
        
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains(expectedMessage)));
    }
    
    // ===== Invalid Name Tests =====
    
    @ParameterizedTest
    @DisplayName("Should fail validation with blank names")
    @CsvSource({
        "'',                Doe,                First name cannot be blank",
        "John,              '',                 Last name cannot be blank"
    })
    public void testUserBlankNames(String firstName, String lastName, String expectedMessage) {
        user = User.builder()
            .id(1L)
            .email("john@example.com")
            .password("password123")
            .firstName(firstName)
            .lastName(lastName)
            .roles(mockRoles)
            .build();
        
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains(expectedMessage)));
    }
    
    // ===== isActive Status Tests =====
    
    @ParameterizedTest
    @DisplayName("Should set isActive correctly")
    @CsvSource({
        "true,              true",
        "false,             false"
    })
    public void testUserIsActive(boolean isActive, boolean expected) {
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .isActive(isActive)
            .roles(mockRoles)
            .build();
        
        assertEquals(expected, user.getIsActive());
    }
    
    @Test
    @DisplayName("Should set isActive to true by default")
    public void testUserIsActiveDefault() {
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(mockRoles)
            .build();
        
        assertTrue(user.getIsActive());
    }
    
    // ===== Timestamps Tests =====
    
    @ParameterizedTest
    @DisplayName("Should initialize timestamps with current time")
    @ValueSource(strings = {"createdAt", "updatedAt"})
    public void testUserTimestamps(String timestampField) {
        LocalDateTime beforeCreation = LocalDateTime.now();
        
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(mockRoles)
            .build();
        
        LocalDateTime afterCreation = LocalDateTime.now();
        LocalDateTime timestamp = "createdAt".equals(timestampField) ? 
            user.getCreatedAt() : user.getUpdatedAt();
        
        assertNotNull(timestamp);
        assertTrue(timestamp.isAfter(beforeCreation.minusSeconds(1)));
        assertTrue(timestamp.isBefore(afterCreation.plusSeconds(1)));
    }
    
    // ===== Roles Tests =====
    
    @Test
    @DisplayName("Should assign mocked roles to user")
    public void testUserWithMockedRoles() {
        user = User.builder()
            .id(1L)
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(mockRoles)
            .build();
        
        assertNotNull(user.getRoles());
        assertEquals(mockRoles, user.getRoles());
    }
    
    @Test
    @DisplayName("Should initialize roles as empty set by default")
    public void testUserRolesDefaultEmpty() {
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .build();
        
        assertNotNull(user.getRoles());
        assertTrue(user.getRoles().isEmpty());
    }
    
    // ===== Equality Tests =====
    
    @Test
    @DisplayName("Should verify user equality")
    public void testUserEquality() {
        User user1 = User.builder()
            .id(1L)
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(mockRoles)
            .build();
        
        User user2 = User.builder()
            .id(1L)
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .roles(mockRoles)
            .build();
        
        assertEquals(user1, user2);
    }
    
    // ===== Builder Defaults Tests =====
    
    @Test
    @DisplayName("Should initialize user with builder defaults")
    public void testUserBuilderDefaults() {
        user = User.builder()
            .email("john@example.com")
            .password("password123")
            .firstName("John")
            .lastName("Doe")
            .build();
        
        assertNull(user.getId());
        assertTrue(user.getIsActive());
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
        assertNotNull(user.getRoles());
        assertTrue(user.getRoles().isEmpty());
    }
    
    // ===== Null Values Tests =====
    
    @Test
    @DisplayName("Should handle null values in validation")
    public void testUserNullValues() {
        user = User.builder()
            .id(1L)
            .email(null)
            .password(null)
            .firstName(null)
            .lastName(null)
            .roles(mockRoles)
            .build();
        
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        
        assertFalse(violations.isEmpty());
    }
}
