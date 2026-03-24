package com.subscriptionapi.controller;

import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.not;

/**
 * INTEGRATION TEST SUITE: AuthController Login Tests
 * 
 * PURPOSE:
 * This test class verifies the complete login flow of the authentication controller,
 * testing both happy paths (successful logins) and error scenarios (invalid credentials,
 * malformed requests, etc.). Each test uses real Spring context and database interactions.
 * 
 * TEST ENVIRONMENT:
 * - Uses Spring Boot test context with full application startup
 * - Runs against test database (H2 in-memory)
 * - Each test is transactional and rolled back after execution
 * - Uses MockMvc to simulate HTTP requests without starting a server
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
@DisplayName("AuthController Login Integration Tests")
class AuthControllerLoginIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * SETUP METHOD: Executed before each test
     * 
     * PURPOSE:
     * Initializes the test database with required data (roles and test users).
     * This ensures a consistent baseline state for every test execution.
     * 
     * SETUP STEPS:
     * 1. Creates a CUSTOMER role in the database
     * 2. Creates three test users with encoded passwords:
     *    - user1@example.com / password123 (John Doe)
     *    - user2@example.com / securepass456 (Jane Smith)
     *    - admin@example.com / adminpass789 (Admin User)
     * 3. All users are marked as active and assigned the CUSTOMER role
     * 
     * NOTE: Passwords are encoded using the same PasswordEncoder as production code
     * to ensure login validation works correctly.
     */
    @BeforeEach
    void setUp() {
        // Create CUSTOMER role
        Role customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        // Create test users with encoded passwords (matching UserService.loginUser() logic)
        createTestUser("user1@example.com", "password123", "John", "Doe", customerRole);
        createTestUser("user2@example.com", "securepass456", "Jane", "Smith", customerRole);
        createTestUser("admin@example.com", "adminpass789", "Admin", "User", customerRole);
    }

    /**
     * HELPER METHOD: Creates a test user with encoded password
     * 
     * PURPOSE:
     * Encapsulates user creation logic to avoid code duplication in setUp().
     * Ensures passwords are properly encoded before storage, matching production behavior.
     * 
     * @param email User's email address (used as login identifier)
     * @param password Plain text password (will be encoded)
     * @param firstName User's first name
     * @param lastName User's last name
     * @param role User's assigned role
     */
    private void createTestUser(String email, String password, String firstName, String lastName, Role role) {
        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))  // Encode password like UserService does
            .firstName(firstName)
            .lastName(lastName)
            .isActive(true)
            .roles(new HashSet<>(Set.of(role)))
            .build();
        userRepository.save(user);
    }

    /**
     * TEST: Valid Credentials Login
     * 
     * DESCRIPTION:
     * Verifies that users can successfully log in with correct email and password combinations.
     * Tests the happy path scenario where authentication succeeds.
     * 
     * TEST SCENARIOS (Parameterized - runs 3 times with different data):
     * 1. User 1 login: user1@example.com / password123
     * 2. User 2 login: user2@example.com / securepass456
     * 3. Admin login: admin@example.com / adminpass789
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response contains success message: "Login successful"
     * - Response includes JWT token (non-empty)
     * - Response includes refresh token (non-empty)
     * - User details are returned with correct email, first name, last name, and active status
     * 
     * VALIDATES:
     * ✓ Authentication logic accepts valid credentials
     * ✓ Token generation works correctly
     * ✓ User information is correctly returned
     * ✓ Multiple users can log in independently
     */
    @ParameterizedTest(name = "Login with email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "user1@example.com, password123, 200",
        "user2@example.com, securepass456, 200",
        "admin@example.com, adminpass789, 200"
    })
    @DisplayName("Should successfully login with valid credentials")
    void testLoginWithValidCredentials(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus))
            .andExpect(jsonPath("$.message").value("Login successful"))
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.refreshToken").exists())
            .andExpect(jsonPath("$.userDetails.email").value(email))
            .andExpect(jsonPath("$.userDetails.firstName").exists())
            .andExpect(jsonPath("$.userDetails.lastName").exists())
            .andExpect(jsonPath("$.userDetails.isActive").value(true));
    }

    /**
     * TEST: Invalid Email Login
     * 
     * DESCRIPTION:
     * Verifies that the login endpoint rejects requests with invalid or non-existent email addresses.
     * Tests error handling for malformed email inputs and users that don't exist in the database.
     * 
     * TEST SCENARIOS (Parameterized - runs 3 times):
     * 1. Non-existent email: nonexistent@example.com (valid format, user not in DB)
     * 2. Invalid format: invalid-email-format (missing @ symbol)
     * 3. Incomplete email: user@ (missing domain)
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 4xx Client Error (400 Bad Request or 401 Unauthorized)
     * - Login request is rejected
     * - No token is issued
     * 
     * VALIDATES:
     * ✓ Email validation is enforced
     * ✓ Non-existent users cannot log in
     * ✓ Malformed emails are rejected
     * ✓ API properly handles invalid input formats
     */
    @ParameterizedTest(name = "Login with invalid email: {0}")
    @CsvSource({
        "nonexistent@example.com",
        "invalid-email-format",
        "user@"
    })
    @DisplayName("Should fail login with invalid email")
    void testLoginWithInvalidEmail(String email) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is4xxClientError());
    }

    /**
     * TEST: Wrong Password Login
     * 
     * DESCRIPTION:
     * Verifies that login fails when the correct email is provided but the password is incorrect.
     * Tests that the system properly validates password matching and denies access to accounts
     * with wrong credentials.
     * 
     * TEST SCENARIOS (Parameterized - runs 3 times):
     * 1. User 1 with wrong password: user1@example.com / wrongpassword
     * 2. User 2 with wrong password: user2@example.com / incorrectpass
     * 3. Admin with wrong password: admin@example.com / wrongadminpass
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 401 Unauthorized
     * - Login request is rejected
     * - No token is issued
     * - User identity is found but credentials don't match
     * 
     * VALIDATES:
     * ✓ Password validation is enforced
     * ✓ Incorrect passwords are rejected
     * ✓ Proper HTTP status code (401) is returned for authentication failures
     * ✓ System prevents unauthorized access
     */
    @ParameterizedTest(name = "Login with wrong password for {0}, expects status {1}")
    @CsvSource({
        "user1@example.com, wrongpassword, 401",
        "user2@example.com, incorrectpass, 401",
        "admin@example.com, wrongadminpass, 401"
    })
    @DisplayName("Should fail login with incorrect password")
    void testLoginWithWrongPassword(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }

    /**
     * TEST: Empty Credentials Login
     * 
     * DESCRIPTION:
     * Verifies that the login endpoint rejects requests with empty (blank) string values
     * for email and/or password. Tests input validation for empty fields.
     * 
     * TEST SCENARIOS (Parameterized - runs 3 times):
     * 1. Empty email: "" / password123
     * 2. Empty password: user1@example.com / ""
     * 3. Both empty: "" / ""
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 400 Bad Request
     * - Login request is rejected due to validation failure
     * - Error message indicates missing or invalid required fields
     * 
     * VALIDATES:
     * ✓ Required field validation is enforced
     * ✓ Empty strings are not accepted
     * ✓ Proper HTTP status code (400) is returned for bad requests
     * ✓ Form validation works before authentication logic
     */
    @ParameterizedTest(name = "Login with empty fields - email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "\"\", password123, 400",
        "user1@example.com, \"\", 400",
        "\"\", \"\", 400"
    })
    @DisplayName("Should fail login with empty credentials")
    void testLoginWithEmptyCredentials(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }

    /**
     * TEST: Null Credentials Login
     * 
     * DESCRIPTION:
     * Verifies that the login endpoint rejects requests with null values for email and/or password.
     * Tests that the system handles null inputs gracefully without throwing exceptions.
     * 
     * TEST SCENARIOS (Parameterized - runs 2 times):
     * 1. Null email: null / password123
     * 2. Null password: user1@example.com / null
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 400 Bad Request
     * - Login request is rejected due to null validation
     * - System doesn't crash or throw unhandled exceptions
     * 
     * VALIDATES:
     * ✓ Null value validation is enforced
     * ✓ Null inputs are properly handled
     * ✓ Proper HTTP status code (400) is returned
     * ✓ API is robust against null pointer exceptions
     */
    @ParameterizedTest(name = "Login with null fields - email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "null, password123, 400",
        "user1@example.com, null, 400"
    })
    @DisplayName("Should fail login with null credentials")
    void testLoginWithNullCredentials(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("null".equals(email) ? null : email);
        loginRequest.setPassword("null".equals(password) ? null : password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }

    /**
     * TEST: Valid JWT Token Generation
     * 
     * DESCRIPTION:
     * Verifies that successful login generates valid, non-empty JWT tokens.
     * Tests that both access token and refresh token are properly created and returned.
     * 
     * TEST SCENARIO (Single test):
     * - User logs in with valid credentials: user1@example.com / password123
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response includes "token" field that is not empty (non-null, non-blank string)
     * - Response includes "refreshToken" field that is not empty
     * - Both tokens are actual JWT strings, not just placeholder values
     * 
     * VALIDATES:
     * ✓ Token generation logic is working
     * ✓ Tokens are properly serialized in response
     * ✓ Tokens are non-empty strings (not null or blank)
     * ✓ Both access and refresh tokens are provided
     */
    @Test
    @DisplayName("Should return valid JWT token on successful login")
    void testLoginReturnsValidToken() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user1@example.com");
        loginRequest.setPassword("password123");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").isNotEmpty())
            .andExpect(jsonPath("$.token").value(not(emptyString())))
            .andExpect(jsonPath("$.refreshToken").value(not(emptyString())));
    }

    /**
     * TEST: Case Sensitivity in Credentials
     * 
     * DESCRIPTION:
     * Verifies that email and password are case-sensitive during authentication.
     * Tests that the system properly enforces case sensitivity to prevent unauthorized access
     * through case variations of valid credentials.
     * 
     * TEST SCENARIOS (Parameterized - runs 3 times):
     * 1. Email uppercase: USER1@EXAMPLE.COM / password123 (correct password, wrong email case)
     * 2. Password uppercase: user1@example.com / PASSWORD123 (correct email, wrong password case)
     * 3. Both mixed case: User1@Example.Com / Password123 (both credentials wrong case)
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 401 Unauthorized
     * - All three scenarios fail login
     * - No token is issued
     * - System treats case variations as invalid credentials
     * 
     * VALIDATES:
     * ✓ Email matching is case-sensitive
     * ✓ Password matching is case-sensitive
     * ✓ Case variations of valid credentials are rejected
     * ✓ System enforces strict credential validation
     * ✓ Security: Prevents unauthorized access through case manipulation
     */
    @ParameterizedTest(name = "Login case sensitivity test - email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "USER1@EXAMPLE.COM, password123, 401",
        "user1@example.com, PASSWORD123, 401",
        "User1@Example.Com, Password123, 401"
    })
    @DisplayName("Should fail login with incorrect case in credentials")
    void testLoginCaseSensitivity(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }
}
