package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.util.PasswordValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("User Service Integration Tests")
public class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordValidator passwordValidator;
    
    private Role customerRole;
    
    @BeforeEach
    public void setUp() {
        // Clear existing data
        userRepository.deleteAll();
        roleRepository.deleteAll();
        
        // Create and persist CUSTOMER role
        customerRole = Role.builder()
                .name(RoleType.CUSTOMER)
                .description("Customer role")
                .permissions(new HashSet<>())
                .users(new HashSet<>())
                .build();
        roleRepository.save(customerRole);
    }
    
    @Test
    @DisplayName("Should register user successfully with valid data")
    public void testRegisterUserSuccess() {
        // Arrange
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("john@example.com")
                .password("ValidPassword123!")
                .passwordConfirm("ValidPassword123!")
                .firstName("John")
                .lastName("Doe")
                .build();
        
        // Act
        AuthResponse response = userService.registerUser(registerRequest);
        
        // Assert
        assertNotNull(response);
        assertEquals("User registered successfully", response.getMessage());
        assertNotNull(response.getUserDetails());
        assertEquals("john@example.com", response.getUserDetails().getEmail());
        assertEquals("John", response.getUserDetails().getFirstName());
        assertEquals("Doe", response.getUserDetails().getLastName());
        assertTrue(response.getUserDetails().getIsActive());
        
        // Verify user is persisted in database
        Optional<User> savedUser = userRepository.findByEmail("john@example.com");
        assertTrue(savedUser.isPresent());
        assertEquals(1, savedUser.get().getRoles().size());
        assertTrue(savedUser.get().getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.CUSTOMER));
    }
    
    @Test
    @DisplayName("Should fail when email already exists")
    public void testRegisterUserWithDuplicateEmail() {
        // Arrange - Create first user
        RegisterRequest firstRequest = RegisterRequest.builder()
                .email("john@example.com")
                .password("ValidPassword123!")
                .passwordConfirm("ValidPassword123!")
                .firstName("John")
                .lastName("Doe")
                .build();
        userService.registerUser(firstRequest);
        
        // Arrange - Try to register with same email
        RegisterRequest duplicateRequest = RegisterRequest.builder()
                .email("john@example.com")
                .password("AnotherPassword123!")
                .passwordConfirm("AnotherPassword123!")
                .firstName("Jane")
                .lastName("Smith")
                .build();
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(duplicateRequest));
        assertEquals("Email already exists", exception.getMessage());
    }
    
    @Test
    @DisplayName("Should fail when passwords do not match")
    public void testRegisterUserPasswordsMismatch() {
        // Arrange
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("john@example.com")
                .password("ValidPassword123!")
                .passwordConfirm("DifferentPassword123!")
                .firstName("John")
                .lastName("Doe")
                .build();
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(registerRequest));
        assertEquals("Passwords do not match", exception.getMessage());
    }
    
    @Test
    @DisplayName("Should fail when password does not meet strength requirements")
    public void testRegisterUserWeakPassword() {
        // Arrange
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("john@example.com")
                .password("weak")
                .passwordConfirm("weak")
                .firstName("John")
                .lastName("Doe")
                .build();
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(registerRequest));
        assertTrue(exception.getMessage().contains("Password does not meet strength requirements"));
    }
    
    @Test
    @DisplayName("Should fail when CUSTOMER role not found")
    public void testRegisterUserCustomerRoleNotFound() {
        // Arrange - Delete the CUSTOMER role
        roleRepository.deleteAll();
        
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("john@example.com")
                .password("ValidPassword123!")
                .passwordConfirm("ValidPassword123!")
                .firstName("John")
                .lastName("Doe")
                .build();
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(registerRequest));
        assertEquals("Default CUSTOMER role not found", exception.getMessage());
    }
    
    @Test
    @DisplayName("Should encode password correctly")
    public void testPasswordEncodingOnRegistration() {
        // Arrange
        String plainPassword = "ValidPassword123!";
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("john@example.com")
                .password(plainPassword)
                .passwordConfirm(plainPassword)
                .firstName("John")
                .lastName("Doe")
                .build();
        
        // Act
        userService.registerUser(registerRequest);
        
        // Assert
        Optional<User> savedUser = userRepository.findByEmail("john@example.com");
        assertTrue(savedUser.isPresent());
        assertNotEquals(plainPassword, savedUser.get().getPassword());
        // Password should be encoded (longer and different)
        assertTrue(savedUser.get().getPassword().length() > plainPassword.length());
    }
}
