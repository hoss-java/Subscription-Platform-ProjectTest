package com.subscriptionapi.controller;

import com.subscriptionapi.dto.*;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RefreshTokenRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
@DisplayName("Authentication Integration Tests")
class AuthenticationIntegrationTest {

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

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private Role customerRole;
    private User testUser;
    private String validToken;

    private static final String TEST_EMAIL = "testuser@example.com";
    private static final String TEST_PASSWORD = "TestPassword123!";
    private static final String INVALID_TOKEN = "invalid.token.here";

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        testUser = new User();
        testUser.setEmail(TEST_EMAIL);
        testUser.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setIsActive(true);
        testUser.setRoles(new HashSet<>(Set.of(customerRole)));
        userRepository.save(testUser);

        validToken = jwtTokenProvider.generateToken(testUser);
    }

    // ==================== REGISTRATION TESTS ====================
    @Nested
    @DisplayName("Registration Endpoint Tests")
    class RegistrationTests {

        /**
         * TEST SCENARIO: Successful User Registration
         * 
         * DESCRIPTION:
         * Verifies that a new user can successfully register with valid credentials
         * and receive a 201 Created response.
         * 
         * PRECONDITIONS:
         * - Email is unique and not already registered
         * - Password meets strength requirements
         * - Passwords match
         * - All required fields are provided
         * 
         * EXPECTED OUTCOME:
         * - HTTP 201 Created response
         * - Success message returned
         * - User is created in the database with CUSTOMER role
         */
        @Test
        @DisplayName("Should register user successfully with valid data")
        void testRegistrationSuccess() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setEmail("newuser@example.com");
            request.setPassword("NewPassword123!");
            request.setPasswordConfirm("NewPassword123!");
            request.setFirstName("New");
            request.setLastName("User");

            mockMvc.perform(post("/api/auth/register")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").exists());
        }

        /**
         * TEST SCENARIO: Registration Failure - Duplicate Email
         * 
         * DESCRIPTION:
         * Verifies that registration fails when attempting to register with an email
         * that already exists in the system.
         * 
         * PRECONDITIONS:
         * - Email already exists in the database
         * - Password meets strength requirements
         * - Passwords match
         * 
         * EXPECTED OUTCOME:
         * - HTTP 409 Conflict response
         * - Error message indicating email already exists
         * - No new user is created
         */
        @Test
        @DisplayName("Should fail registration with duplicate email")
        void testRegistrationWithDuplicateEmail() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setEmail(TEST_EMAIL);
            request.setPassword("NewPassword123!");
            request.setPasswordConfirm("NewPassword123!");
            request.setFirstName("Duplicate");
            request.setLastName("User");

            mockMvc.perform(post("/api/auth/register")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").exists());
        }

        /**
         * TEST SCENARIO: Registration Failure - Blank Required Fields
         * 
         * DESCRIPTION:
         * Verifies that registration fails when any required field (email, password,
         * firstName, lastName) is left blank.
         * 
         * PRECONDITIONS:
         * - At least one required field is blank
         * - Request body is sent with missing or empty values
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Validation error message returned
         * - No new user is created
         */
        @ParameterizedTest(name = "Email: {0}, Password: {1}, FirstName: {2}, LastName: {3}")
        @CsvSource({
            "'', NewPassword123!, New, User",           // Blank email
            "newuser@example.com, '', New, User",       // Blank password
            "newuser@example.com, NewPassword123!, '', User",  // Blank first name
            "newuser@example.com, NewPassword123!, New, ''",   // Blank last name
        })
        @DisplayName("Should fail registration with blank required fields")
        void testRegistrationWithBlankFields(String email, String password, String firstName, String lastName) throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setEmail(email.isEmpty() ? "" : email);
            request.setPassword(password.isEmpty() ? "" : password);
            request.setFirstName(firstName.isEmpty() ? "" : firstName);
            request.setLastName(lastName.isEmpty() ? "" : lastName);

            mockMvc.perform(post("/api/auth/register")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        /**
         * TEST SCENARIO: Registration Failure - Invalid Email Format
         * 
         * DESCRIPTION:
         * Verifies that registration fails when the provided email does not match
         * the valid email format pattern.
         * 
         * PRECONDITIONS:
         * - Email format is invalid (missing @, domain, or other violations)
         * - Password meets strength requirements
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Validation error for invalid email format
         * - No new user is created
         */
        @ParameterizedTest(name = "Invalid email: {0}")
        @ValueSource(strings = {
            "invalid-email",
            "user@",
            "@example.com",
            "user @example.com"
        })
        @DisplayName("Should fail registration with invalid email format")
        void testRegistrationWithInvalidEmailFormat(String email) throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setEmail(email);
            request.setPassword("NewPassword123!");
            request.setFirstName("New");
            request.setLastName("User");

            mockMvc.perform(post("/api/auth/register")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== LOGIN TESTS ====================
    @Nested
    @DisplayName("Login Endpoint Tests")
    class LoginTests {

        /**
         * TEST SCENARIO: Successful User Login
         * 
         * DESCRIPTION:
         * Verifies that an authenticated user can successfully login with correct
         * email and password credentials.
         * 
         * PRECONDITIONS:
         * - User account exists in the database
         * - Email and password are correct
         * - User account is active
         * 
         * EXPECTED OUTCOME:
         * - HTTP 200 OK response
         * - JWT token is returned
         * - Success message is provided
         */
        @Test
        @DisplayName("Should login successfully with valid credentials")
        void testLoginSuccess() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setEmail(TEST_EMAIL);
            request.setPassword(TEST_PASSWORD);

            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.message").exists());
        }

        /**
         * TEST SCENARIO: Login Failure - Invalid Credentials
         * 
         * DESCRIPTION:
         * Verifies that login fails when provided with invalid credentials such as
         * non-existent email, incorrect password, or case-sensitive password mismatch.
         * 
         * PRECONDITIONS:
         * - Email does not exist OR password is incorrect OR case is wrong
         * - Request is properly formatted
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - No token is returned
         * - User is not authenticated
         */
        @ParameterizedTest(name = "Email: {0}, Password: {1}")
        @CsvSource({
            "nonexistent@example.com, TestPassword123!",
            "testuser@example.com, WrongPassword123!",
            "testuser@example.com, testpassword123!",  // Wrong case
        })
        @DisplayName("Should fail login with invalid credentials")
        void testLoginWithInvalidCredentials(String email, String password) throws Exception {
            LoginRequest request = new LoginRequest();
            request.setEmail(email);
            request.setPassword(password);

            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * TEST SCENARIO: Login Failure - Blank Credentials
         * 
         * DESCRIPTION:
         * Verifies that login fails when email and/or password fields are left blank
         * or empty.
         * 
         * PRECONDITIONS:
         * - Email and/or password is blank
         * - Request is sent with missing values
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Validation error message returned
         * - User is not authenticated
         */
        @ParameterizedTest(name = "Email: {0}, Password: {1}")
        @CsvSource({
            "'', TestPassword123!",
            "testuser@example.com, ''",
            "'', ''",
        })
        @DisplayName("Should fail login with blank credentials")
        void testLoginWithBlankCredentials(String email, String password) throws Exception {
            LoginRequest request = new LoginRequest();
            request.setEmail(email.isEmpty() ? "" : email);
            request.setPassword(password.isEmpty() ? "" : password);

            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        /**
         * TEST SCENARIO: Login Returns Valid JWT Token
         * 
         * DESCRIPTION:
         * Verifies that a successful login returns a properly formatted JWT token
         * that matches the standard JWT structure.
         * 
         * PRECONDITIONS:
         * - User credentials are valid
         * - User account is active
         * 
         * EXPECTED OUTCOME:
         * - HTTP 200 OK response
         * - JWT token is returned and not empty
         * - Token matches JWT format pattern (header.payload.signature)
         */
        @Test
        @DisplayName("Should return valid JWT token on successful login")
        void testLoginReturnsValidToken() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setEmail(TEST_EMAIL);
            request.setPassword(TEST_PASSWORD);

            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.token", matchesPattern("^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+$")));
        }
    }

    // ==================== TOKEN VALIDATION TESTS ====================
    @Nested
    @DisplayName("Token Validation Endpoint Tests")
    class TokenValidationTests {

        /**
         * TEST SCENARIO: Successful Token Validation
         * 
         * DESCRIPTION:
         * Verifies that a valid JWT token can be successfully validated and returns
         * a confirmation of its validity.
         * 
         * PRECONDITIONS:
         * - Token is valid and not expired
         * - Token is properly formatted
         * - Token is included in Authorization header with Bearer prefix
         * 
         * EXPECTED OUTCOME:
         * - HTTP 200 OK response
         * - Response contains valid: true
         * - Token is confirmed as valid
         */
        @Test
        @DisplayName("Should validate token successfully with valid token")
        void testValidateTokenSuccess() throws Exception {
            mockMvc.perform(get("/api/auth/validate")
                    .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.valid").value(true));
        }

        /**
         * TEST SCENARIO: Token Validation Failure - Missing Token
         * 
         * DESCRIPTION:
         * Verifies that token validation fails when no Authorization header is
         * provided with the request.
         * 
         * PRECONDITIONS:
         * - No Authorization header is sent
         * - Request is sent without token
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Token validation fails
         */
        @Test
        @DisplayName("Should fail token validation without token")
        void testValidateTokenWithoutToken() throws Exception {
            mockMvc.perform(get("/api/auth/validate"))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * TEST SCENARIO: Token Validation Failure - Invalid Token
         * 
         * DESCRIPTION:
         * Verifies that token validation fails when an invalid or tampered token
         * is provided in the Authorization header.
         * 
         * PRECONDITIONS:
         * - Token is invalid or malformed
         * - Token is not properly signed
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Token validation fails
         */
        @Test
        @DisplayName("Should fail token validation with invalid token")
        void testValidateTokenWithInvalidToken() throws Exception {
            mockMvc.perform(get("/api/auth/validate")
                    .header("Authorization", "Bearer " + INVALID_TOKEN))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * TEST SCENARIO: Token Validation Failure - Malformed Token Format
         * 
         * DESCRIPTION:
         * Verifies that token validation fails when the token format is malformed
         * or does not follow the expected Bearer token structure.
         * 
         * PRECONDITIONS:
         * - Token format is invalid (missing Bearer prefix, wrong structure, etc.)
         * - Authorization header is present but improperly formatted
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Token validation fails due to format error
         */
        @ParameterizedTest(name = "Token format: {0}")
        @ValueSource(strings = {
            "InvalidToken",
            "Bearer",
            "BearerInvalidToken",
            ""
        })
        @DisplayName("Should fail token validation with malformed token")
        void testValidateTokenWithMalformedToken(String token) throws Exception {
            mockMvc.perform(get("/api/auth/validate")
                    .header("Authorization", token))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ==================== PROTECTED ENDPOINT TESTS ====================
    @Nested
    @DisplayName("Protected Endpoints Access Control Tests")
    class ProtectedEndpointsTests {

        /**
         * TEST SCENARIO: Access Protected Endpoint with Valid Token
         * 
         * DESCRIPTION:
         * Verifies that an authenticated user with a valid JWT token can access
         * protected endpoints.
         * 
         * PRECONDITIONS:
         * - User is authenticated with a valid JWT token
         * - Token is not expired
         * - Token is properly included in Authorization header
         * 
         * EXPECTED OUTCOME:
         * - HTTP 200 OK response
         * - Access to protected endpoint is granted
         */
        @Test
        @DisplayName("Should access protected endpoint with valid token")
        void testAccessProtectedEndpointWithValidToken() throws Exception {
            mockMvc.perform(get("/api/auth/validate")
                    .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isOk());
        }

        /**
         * TEST SCENARIO: Access Protected Endpoint - Missing Token
         * 
         * DESCRIPTION:
         * Verifies that access to protected endpoints is denied when no JWT token
         * is provided in the request.
         * 
         * PRECONDITIONS:
         * - No Authorization header is sent
         * - Request is sent without authentication
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Access to protected endpoint is denied
         */
        @Test
        @DisplayName("Should deny access to protected endpoint without token")
        void testAccessProtectedEndpointWithoutToken() throws Exception {
            mockMvc.perform(get("/api/auth/validate"))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * TEST SCENARIO: Access Protected Endpoint - Expired Token
         * 
         * DESCRIPTION:
         * Verifies that access to protected endpoints is denied when an expired JWT
         * token is provided.
         * 
         * PRECONDITIONS:
         * - Token was valid but is now expired
         * - Token is properly formatted but its expiration time has passed
         * - Token is included in Authorization header with Bearer prefix
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Access to protected endpoint is denied
         * - User must re-authenticate with a new token
         */
        @Test
        @DisplayName("Should deny access to protected endpoint with expired token")
        void testAccessProtectedEndpointWithExpiredToken() throws Exception {
            String expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalid";

            mockMvc.perform(get("/api/auth/validate")
                    .header("Authorization", "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Token Refresh Endpoint Tests")
    class TokenRefreshTests {

        @Test
        @DisplayName("Should refresh token successfully with valid refresh token")
        void testRefreshTokenSuccess() throws Exception {
            // First login to get refresh token
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(TEST_EMAIL);
            loginRequest.setPassword(TEST_PASSWORD);

            String loginResponse = mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            AuthResponse authResponse = objectMapper.readValue(loginResponse, AuthResponse.class);
            String refreshToken = authResponse.getRefreshToken();

            // Now refresh the token
            RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
            refreshRequest.setRefreshToken(refreshToken);

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.refreshToken").exists())
                    .andExpect(jsonPath("$.message").value("Token refreshed successfully"));
        }

        @Test
        @DisplayName("Should fail token refresh with invalid refresh token")
        void testRefreshTokenWithInvalidToken() throws Exception {
            RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
            refreshRequest.setRefreshToken("invalid.refresh.token");

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should fail token refresh with blank refresh token")
        void testRefreshTokenWithBlankToken() throws Exception {

            RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
            refreshRequest.setRefreshToken("");

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isBadRequest());
        }
    }
}
