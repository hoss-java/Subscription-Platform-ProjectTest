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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================================
 * USER SERVICE INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * This test class validates the complete user registration workflow, including:
 * - Successful registration with valid data
 * - Password validation and encoding
 * - Duplicate email prevention
 * - Role assignment
 * - Error handling for various failure scenarios
 * 
 * Test Organization:
 * 1. Setup Phase: Initialize test data and dependencies
 * 2. Happy Path Tests: Verify successful registration scenarios
 * 3. Failure Path Tests: Verify proper error handling
 * 4. Helper Methods: Centralized test data creation
 * 
 * ============================================================================
 */
@SpringBootTest
@ActiveProfiles("dev")
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
        userRepository.deleteAll();
        
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
    }

    // ============================================================================
    // SECTION 1: HAPPY PATH TESTS - SUCCESSFUL REGISTRATION SCENARIOS
    // ============================================================================
    // 
    // Purpose: Verify that the user registration service works correctly with
    //          valid input data. These tests ensure the core functionality:
    //          - User is created with correct attributes
    //          - User is persisted to the database
    //          - Default CUSTOMER role is assigned
    //          - Response contains expected success message
    //
    // ============================================================================
    
    @Test
    @DisplayName("Should register user successfully with valid data")
    public void testRegisterUserSuccess() {
        // Scenario: A new user provides all required valid information
        // Expected: User is registered, persisted, and assigned CUSTOMER role
        
        RegisterRequest registerRequest = createValidRegisterRequest("john@example.com", "John", "Doe");
        
        AuthResponse response = userService.registerUser(registerRequest);
        
        // Verify response contains success message
        assertNotNull(response);
        assertEquals("User registered successfully", response.getMessage());
        assertNotNull(response.getUserDetails());
        
        // Verify user details match request
        assertEquals("john@example.com", response.getUserDetails().getEmail());
        assertEquals("John", response.getUserDetails().getFirstName());
        assertEquals("Doe", response.getUserDetails().getLastName());
        assertTrue(response.getUserDetails().getIsActive());
        
        // Verify user is persisted in database with correct role
        Optional<User> savedUser = userRepository.findByEmail("john@example.com");
        assertTrue(savedUser.isPresent());
        assertEquals(1, savedUser.get().getRoles().size());
        assertTrue(savedUser.get().getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.CUSTOMER));
    }
    
    // ============================================================================
    // SECTION 2: PASSWORD ENCODING TESTS
    // ============================================================================
    //
    // Purpose: Verify that passwords are properly encoded before storage.
    //          Passwords should NEVER be stored in plain text.
    //
    // Test Strategy: Parameterized test with multiple valid password formats
    // - Each password represents a different complexity level
    // - All should be accepted (meet strength requirements)
    // - All should be encoded (not stored as plain text)
    //
    // Scenarios Tested:
    // 1. "ValidPassword123!" - Standard password with mixed case, number, special char
    // 2. "AnotherSecure@Pass456" - Longer password with @ symbol
    // 3. "ComplexP@ssw0rd!" - Password with multiple special characters
    // 4. "MyP@ssw0rd2024!" - Password with year (common pattern)
    //
    // ============================================================================
    
    @ParameterizedTest(name = "Password encoding test with: {0}")
    @DisplayName("Should encode password correctly for various valid passwords")
    @ValueSource(strings = {
            "ValidPassword123!",
            "AnotherSecure@Pass456",
            "ComplexP@ssw0rd!",
            "MyP@ssw0rd2024!"
    })
    public void testPasswordEncodingOnRegistration(String plainPassword) {
        // Scenario: User registers with a valid password
        // Expected: Password is encoded and stored differently than plain text
        
        RegisterRequest registerRequest = createValidRegisterRequest("john@example.com", "John", "Doe");
        registerRequest.setPassword(plainPassword);
        registerRequest.setPasswordConfirm(plainPassword);
        
        userService.registerUser(registerRequest);
        
        Optional<User> savedUser = userRepository.findByEmail("john@example.com");
        assertTrue(savedUser.isPresent());
        
        // Verify password is NOT stored as plain text
        assertNotEquals(plainPassword, savedUser.get().getPassword(),
                "Password should be encoded, not stored as plain text");
        
        // Verify encoded password is longer (typical of bcrypt or similar)
        assertTrue(savedUser.get().getPassword().length() > plainPassword.length(),
                "Encoded password should be longer than plain text");
    }
    
    // ============================================================================
    // SECTION 3: DUPLICATE EMAIL PREVENTION
    // ============================================================================
    //
    // Purpose: Ensure the system prevents multiple accounts with the same email.
    //          Email uniqueness is critical for user identification and login.
    //
    // Scenario: 
    // 1. First user registers with email "john@example.com"
    // 2. Second user attempts to register with same email
    // 3. System should reject the duplicate registration
    //
    // ============================================================================
    
    @Test
    @DisplayName("Should fail when email already exists")
    public void testRegisterUserWithDuplicateEmail() {
        // Step 1: Register first user successfully
        RegisterRequest firstRequest = createValidRegisterRequest("john@example.com", "John", "Doe");
        userService.registerUser(firstRequest);
        
        // Step 2: Attempt to register second user with same email
        RegisterRequest duplicateRequest = createValidRegisterRequest("john@example.com", "Jane", "Smith");
        
        // Step 3: Verify system rejects duplicate
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(duplicateRequest),
                "Should throw exception when email already exists");
        assertEquals("Email already exists", exception.getMessage());
    }
    
    // ============================================================================
    // SECTION 4: PASSWORD VALIDATION TESTS
    // ============================================================================
    //
    // Purpose: Verify that the system enforces password strength requirements
    //          and validates that password and confirmation match.
    //
    // Test Strategy: Parametrized test combining multiple failure scenarios
    // Each row represents: [password, passwordConfirm, expectedErrorMessage]
    //
    // Scenarios Tested:
    // 1. Weak password - Too simple (no uppercase, numbers, special chars)
    // 2. Password mismatch - Confirmation doesn't match password
    // 3. Short password - Insufficient length
    // 4. No uppercase - Missing uppercase letters
    // 5. No lowercase - Missing lowercase letters
    //
    // Expected Behavior: All should be rejected with appropriate error messages
    //
    // ============================================================================
    
    @ParameterizedTest(name = "Password validation: {2}")
    @DisplayName("Should fail with invalid password scenarios")
    @CsvSource({
            "weak,                          weak,                           'Password does not meet strength requirements'",
            "ValidPassword123!,             DifferentPassword123!,          'Passwords do not match'",
            "short,                         short,                          'Password does not meet strength requirements'",
            "nouppercaseornumber,           nouppercaseornumber,            'Password does not meet strength requirements'",
            "NOLOWERCASE123!,               NOLOWERCASE123!,                'Password does not meet strength requirements'"
    })
    public void testRegisterUserWithInvalidPasswords(String password, String passwordConfirm, String expectedErrorMessage) {
        // Scenario: User attempts to register with invalid password
        // Expected: Registration fails with appropriate error message
        
        RegisterRequest registerRequest = createValidRegisterRequest("john@example.com", "John", "Doe");
        registerRequest.setPassword(password);
        registerRequest.setPasswordConfirm(passwordConfirm);
        
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(registerRequest),
                String.format("Should reject password: %s", password));
        
        assertTrue(exception.getMessage().contains(expectedErrorMessage),
                String.format("Expected message to contain '%s', but got '%s'", 
                        expectedErrorMessage, exception.getMessage()));
    }
    
    // ============================================================================
    // SECTION 5: ROLE ASSIGNMENT VALIDATION
    // ============================================================================
    //
    // Purpose: Verify that the system properly handles the case where the
    //          default CUSTOMER role is missing from the database.
    //          This tests error handling for system configuration issues.
    //
    // Scenario:
    // 1. Delete the CUSTOMER role from database (simulating configuration error)
    // 2. Attempt to register a new user
    // 3. System should fail with clear error message
    //
    // ============================================================================
    
    @Test
    @DisplayName("Should fail when CUSTOMER role not found")
    public void testRegisterUserCustomerRoleNotFound() {
        // Scenario: System is misconfigured - CUSTOMER role doesn't exist
        // Expected: Clear error message indicating role is missing
        
        roleRepository.deleteAll();
        
        RegisterRequest registerRequest = createValidRegisterRequest("john@example.com", "John", "Doe");
        
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(registerRequest),
                "Should fail when CUSTOMER role is missing");
        assertEquals("Default CUSTOMER role not found", exception.getMessage());
    }
    
    // ============================================================================
    // SECTION 6: EMAIL FORMAT VALIDATION
    // ============================================================================
    //
    // Purpose: Verify that the system validates email format before processing.
    //          Invalid email formats should be rejected immediately.
    //
    // Test Strategy: Parametrized test with multiple invalid email formats
    //
    // Invalid Email Scenarios:
    // 1. "invalidemail" - Missing @ symbol
    // 2. "invalid@" - Missing domain
    // 3. "@invalid.com" - Missing local part
    // 4. "invalid@.com" - Missing domain name
    // 5. "invalid..@example.com" - Double dots (invalid format)
    //
    // Expected Behavior: All should be rejected during validation
    //
    // ============================================================================
    
    @ParameterizedTest(name = "Invalid email format: {0}")
    @DisplayName("Should fail with invalid email formats")
    @ValueSource(strings = {
            "invalidemail",
            "invalid@",
            "@invalid.com",
            "invalid@.com",
            "invalid..@example.com"
    })
    public void testRegisterUserWithInvalidEmails(String invalidEmail) {
        // Scenario: User attempts to register with invalid email format
        // Expected: Registration fails with validation error
        
        RegisterRequest registerRequest = createValidRegisterRequest(invalidEmail, "John", "Doe");
        
        assertThrows(RuntimeException.class, 
                () -> userService.registerUser(registerRequest),
                String.format("Should reject invalid email: %s", invalidEmail));
    }
    
    // ============================================================================
    // HELPER METHODS - TEST DATA FACTORY
    // ============================================================================
    //
    // Purpose: Centralize the creation of valid RegisterRequest objects.
    //          This reduces code duplication and makes tests more maintainable.
    //          Changes to request structure only need to be made in one place.
    //
    // ============================================================================
    
    /**
     * Factory method to create a valid RegisterRequest with default values.
     * 
     * @param email The email address for the user
     * @param firstName The first name of the user
     * @param lastName The last name of the user
     * @return A RegisterRequest with valid default values for other fields
     * 
     * Usage:
     *   RegisterRequest req = createValidRegisterRequest("test@example.com", "John", "Doe");
     *   
     * Benefits:
     * - Single source of truth for valid test data
     * - Easy to modify default values for all tests
     * - Reduces boilerplate in test methods
     * - Clear intent: "create a valid request with these specific values"
     */
    private RegisterRequest createValidRegisterRequest(String email, String firstName, String lastName) {
        return RegisterRequest.builder()
                .email(email)
                .password("ValidPassword123!")        // Default valid password (meets all requirements)
                .passwordConfirm("ValidPassword123!")  // Must match password
                .firstName(firstName)
                .lastName(lastName)
                .build();
    }
}
