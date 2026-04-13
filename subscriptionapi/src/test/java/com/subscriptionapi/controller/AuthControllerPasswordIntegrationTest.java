package com.subscriptionapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subscriptionapi.dto.ChangePasswordRequest;
import com.subscriptionapi.dto.ForgotPasswordRequest;
import com.subscriptionapi.dto.ResetPasswordRequest;
import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.entity.PasswordResetToken;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.repository.PasswordResetTokenRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.HashSet;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthController Password Endpoints Integration Tests")
class AuthControllerPasswordIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    private Role customerRole;
    private User testUser;
    private String validToken;

    private static final String TEST_EMAIL = "testuser@example.com";
    private static final String OLD_PASSWORD = "OldPassword123!";
    private static final String NEW_PASSWORD = "NewPassword456!";
    private static final String RESET_PASSWORD = "ResetPassword789!";
    private static final String INVALID_TOKEN = "invalid-token-12345";

    /**
     * SETUP METHOD: Executed before each test
     * 
     * PURPOSE:
     * Initializes the test database with required data for password endpoint testing.
     * Creates a test user with known credentials and generates a valid JWT token
     * for authenticated endpoints.
     * 
     * SETUP STEPS:
     * 1. Creates a CUSTOMER role in the database
     * 2. Creates a test user (testuser@example.com / OldPassword123!)
     * 3. Generates a valid JWT token for the test user
     * 4. Cleans up any existing password reset tokens
     */
    @BeforeEach
    void setUp() {
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        testUser = new User();
        testUser.setEmail(TEST_EMAIL);
        testUser.setPassword(passwordEncoder.encode(OLD_PASSWORD));
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setIsActive(true);
        testUser.setRoles(new HashSet<>());
        testUser.getRoles().add(customerRole);
        userRepository.save(testUser);

        validToken = generateValidToken(testUser.getId());
    }

    // ==================== CHANGE PASSWORD TESTS ====================
    @Nested
    @DisplayName("Change Password Endpoint Tests")
    class ChangePasswordTests {

        /**
         * TEST SCENARIO: Successful Password Change
         * 
         * DESCRIPTION:
         * Verifies that an authenticated user can successfully change their password
         * by providing the correct old password and a new password.
         * 
         * PRECONDITIONS:
         * - User is authenticated with a valid JWT token
         * - User provides the correct old password
         * - New password meets validation requirements
         * 
         * EXPECTED OUTCOME:
         * - HTTP 200 OK response
         * - Success message returned
         * - Database password is updated and encoded
         */
        @Test
        @DisplayName("Should change password successfully with valid credentials")
        void testChangePasswordSuccess() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setOldPassword(OLD_PASSWORD);
            request.setNewPassword(NEW_PASSWORD);

            mockMvc.perform(post("/api/auth/change-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password changed successfully"));

            User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
            assert passwordEncoder.matches(NEW_PASSWORD, updatedUser.getPassword());
        }

        /**
         * TEST SCENARIO: Password Change with Invalid Old Password
         * 
         * DESCRIPTION:
         * Verifies that password change fails when user provides an incorrect old password.
         * This prevents unauthorized password changes.
         * 
         * PRECONDITIONS:
         * - User is authenticated with a valid JWT token
         * - User provides an incorrect old password
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Password remains unchanged in database
         */
        @Test
        @DisplayName("Should fail to change password with incorrect old password")
        void testChangePasswordWithIncorrectOldPassword() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setOldPassword("WrongPassword123!");
            request.setNewPassword(NEW_PASSWORD);

            mockMvc.perform(post("/api/auth/change-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        /**
         * TEST SCENARIO: Password Change Without Authentication Token
         * 
         * DESCRIPTION:
         * Verifies that unauthenticated users cannot change passwords.
         * Authentication is mandatory for this endpoint.
         * 
         * PRECONDITIONS:
         * - No Authorization header is provided
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Request is rejected at authentication filter level
         */
        @Test
        @DisplayName("Should fail to change password without authentication token")
        void testChangePasswordWithoutToken() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setOldPassword(OLD_PASSWORD);
            request.setNewPassword(NEW_PASSWORD);

            mockMvc.perform(post("/api/auth/change-password")
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * TEST SCENARIO: Password Change with Invalid JWT Token
         * 
         * DESCRIPTION:
         * Verifies that malformed or tampered JWT tokens are rejected.
         * This ensures token validation is working correctly.
         * 
         * PRECONDITIONS:
         * - Authorization header contains an invalid/malformed token
         * 
         * EXPECTED OUTCOME:
         * - HTTP 401 Unauthorized response
         * - Token validation fails
         */
        @Test
        @DisplayName("Should fail to change password with invalid token")
        void testChangePasswordWithInvalidToken() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setOldPassword(OLD_PASSWORD);
            request.setNewPassword(NEW_PASSWORD);

            mockMvc.perform(post("/api/auth/change-password")
                    .header("Authorization", "Bearer invalidtoken123")
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        /**
         * TEST SCENARIO: Password Change with Invalid Input (Blank/Null Fields)
         * 
         * DESCRIPTION:
         * Verifies that the endpoint validates required fields and rejects
         * requests with blank or null passwords. Uses parametrized testing
         * to cover multiple invalid scenarios efficiently.
         * 
         * PRECONDITIONS:
         * - User is authenticated with a valid JWT token
         * - One or both password fields are blank/empty
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Validation error message returned
         * 
         * TEST CASES:
         * 1. Blank old password with valid new password
         * 2. Valid old password with blank new password
         */
        @ParameterizedTest(name = "Old Password: {0}, New Password: {1}")
        @CsvSource({
            "'',NewPassword456!",  // Blank old password
            "OldPassword123!,''",  // Blank new password
        })
        @DisplayName("Should fail to change password with blank password fields")
        void testChangePasswordWithBlankFields(String oldPassword, String newPassword) throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setOldPassword(oldPassword);
            request.setNewPassword(newPassword);

            mockMvc.perform(post("/api/auth/change-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== FORGOT PASSWORD TESTS ====================

    @Nested
    @DisplayName("Forgot Password Endpoint Tests")
    class ForgotPasswordTests {

        /**
         * TEST SCENARIO: Successful Password Reset Initiation
         * 
         * DESCRIPTION:
         * Verifies that users can initiate a password reset by providing their
         * registered email address. A reset token is generated and should be
         * sent via email (mocked in tests).
         * 
         * PRECONDITIONS:
         * - User with the provided email exists in the database
         * - User account is active
         * 
         * EXPECTED OUTCOME:
         * - HTTP 200 OK response
         * - Success message confirming reset link sent
         * - Password reset token created in database
         */
        @Test
        @DisplayName("Should initiate password reset for valid email")
        void testForgotPasswordSuccess() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail(TEST_EMAIL);

            mockMvc.perform(post("/api/auth/forgot-password")
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("Password reset link has been sent")));

            assert passwordResetTokenRepository.findByUserAndIsUsedFalse(testUser).isPresent();
        }

        /**
         * TEST SCENARIO: Forgot Password with Non-Existent Email
         * 
         * DESCRIPTION:
         * Verifies that the endpoint returns a not-found error when an email
         * address that is not registered in the system is provided.
         * 
         * PRECONDITIONS:
         * - Email address does not exist in the user database
         * 
         * EXPECTED OUTCOME:
         * - HTTP 404 Not Found response
         * - No password reset token is created
         */
        @Test
        @DisplayName("Should fail forgot password with non-existent email")
        void testForgotPasswordWithNonExistentEmail() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("nonexistent@example.com");

            mockMvc.perform(post("/api/auth/forgot-password")
                    .contentType(APPLICATION_JSON)  // No Authorization header
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        /**
         * TEST SCENARIO: Forgot Password with Invalid Email Input
         * 
         * DESCRIPTION:
         * Verifies that the endpoint validates email format and rejects
         * requests with blank or malformed email addresses using parametrized testing.
         * 
         * PRECONDITIONS:
         * - Email field is blank, null, or has invalid format
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Validation error message returned
         * 
         * TEST CASES:
         * 1. Blank email string
         * 2. Invalid email format (no @ symbol)
         * 3. Invalid email format (missing domain)
         * 4. Invalid email format (missing local part)
         */
        @ParameterizedTest(name = "Email: {0}")
        @ValueSource(strings = {
            "",                      // Blank email
            "invalid-email-format",  // Missing @ symbol
            "user@",                 // Missing domain
            "@example.com"           // Missing local part
        })
        @DisplayName("Should fail forgot password with invalid email")
        void testForgotPasswordWithInvalidEmail(String email) throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail(email);

            mockMvc.perform(post("/api/auth/forgot-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        /**
         * TEST SCENARIO: Forgot Password for Inactive User Account
         * 
         * DESCRIPTION:
         * Verifies that inactive or deactivated user accounts cannot initiate
         * password resets. This prevents access to disabled accounts.
         * 
         * PRECONDITIONS:
         * - User with the provided email exists but is marked as inactive
         * 
         * EXPECTED OUTCOME:
         * - HTTP 403 Forbidden response
         * - No password reset token is created
         * - User is informed account is inactive
         */
        @Test
        @DisplayName("Should fail forgot password for inactive user")
        void testForgotPasswordForInactiveUser() throws Exception {
            testUser.setIsActive(false);
            userRepository.save(testUser);

            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail(TEST_EMAIL);

            mockMvc.perform(post("/api/auth/forgot-password")
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== RESET PASSWORD TESTS ====================
    @Nested
    @DisplayName("Reset Password Endpoint Tests")
    class ResetPasswordTests {

        /**
         * TEST SCENARIO: Successful Password Reset with Valid Token
         * 
         * DESCRIPTION:
         * Verifies that users can successfully reset their password using a
         * valid, non-expired reset token. The token is marked as used after
         * successful reset to prevent reuse.
         * 
         * PRECONDITIONS:
         * - Valid password reset token exists
         * - Token has not expired
         * - Token has not been previously used
         * - New password meets validation requirements
         * 
         * EXPECTED OUTCOME:
         * - HTTP 200 OK response
         * - Success message returned
         * - User password is updated in database
         * - Reset token is marked as used
         */
        @Test
        @DisplayName("Should reset password successfully with valid token")
        void testResetPasswordSuccess() throws Exception {
            String resetToken = createValidResetToken(testUser);

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken(resetToken);
            request.setNewPassword(RESET_PASSWORD);

            mockMvc.perform(post("/api/auth/reset-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password has been reset successfully"));

            User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
            assert passwordEncoder.matches(RESET_PASSWORD, updatedUser.getPassword());

            PasswordResetToken usedToken = passwordResetTokenRepository.findByToken(resetToken).orElseThrow();
            assert usedToken.getIsUsed();
        }

        /**
         * TEST SCENARIO: Reset Password with Invalid Token
         * 
         * DESCRIPTION:
         * Verifies that the endpoint rejects reset requests with tokens that
         * do not exist in the database. This prevents unauthorized password resets.
         * 
         * PRECONDITIONS:
         * - Token does not exist in the password reset token repository
         * 
         * EXPECTED OUTCOME:
         * - HTTP 404 Not Found response
         * - Password remains unchanged
         * - No token is marked as used
         */
        @Test
        @DisplayName("Should fail reset password with invalid token")
        void testResetPasswordWithInvalidToken() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken(INVALID_TOKEN);
            request.setNewPassword(RESET_PASSWORD);

            mockMvc.perform(post("/api/auth/reset-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        /**
         * TEST SCENARIO: Reset Password with Expired Token
         * 
         * DESCRIPTION:
         * Verifies that expired reset tokens are rejected. Tokens have a
         * limited validity period (typically 24 hours) for security reasons.
         * 
         * PRECONDITIONS:
         * - Password reset token exists but has expired
         * - Current time is past the token's expiration time
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Password remains unchanged
         * - User is informed token has expired
         */
        @Test
        @DisplayName("Should fail reset password with expired token")
        void testResetPasswordWithExpiredToken() throws Exception {
            String resetToken = createExpiredResetToken(testUser);

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken(resetToken);
            request.setNewPassword(RESET_PASSWORD);

            mockMvc.perform(post("/api/auth/reset-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        /**
         * TEST SCENARIO: Reset Password with Already Used Token
         * 
         * DESCRIPTION:
         * Verifies that reset tokens can only be used once. After a successful
         * password reset, the token is marked as used and cannot be reused
         * to reset the password again.
         * 
         * PRECONDITIONS:
         * - Password reset token exists but has already been used
         * - Token's isUsed flag is set to true
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Password remains unchanged
         * - User is informed token has already been used
         */
        @Test
        @DisplayName("Should fail reset password with already used token")
        void testResetPasswordWithAlreadyUsedToken() throws Exception {
            String resetToken = createUsedResetToken(testUser);

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken(resetToken);
            request.setNewPassword(RESET_PASSWORD);

            mockMvc.perform(post("/api/auth/reset-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        /**
         * TEST SCENARIO: Reset Password with Invalid Input
         * 
         * DESCRIPTION:
         * Verifies that the endpoint validates required fields and rejects
         * requests with blank or null token/password values using parametrized testing.
         * 
         * PRECONDITIONS:
         * - Token field is blank/empty OR new password field is blank/empty
         * 
         * EXPECTED OUTCOME:
         * - HTTP 400 Bad Request response
         * - Validation error message returned
         * 
         * TEST CASES:
         * 1. Blank token with valid new password
         * 2. Valid token with blank new password
         * 3. Both token and password blank
         */
        @ParameterizedTest(name = "Token: {0}, New Password: {1}")
        @CsvSource({
            "'',' ResetPassword789!'",           // Blank token
            "'validtoken123',''",              // Blank new password
            "'',' ''",                         // Both blank
        })
        @DisplayName("Should fail reset password with blank input fields")
        void testResetPasswordWithBlankFields(String token, String newPassword) throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken(token);
            request.setNewPassword(newPassword);

            mockMvc.perform(post("/api/auth/reset-password")
                    .header("Authorization", "Bearer " + validToken)
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Helper method to generate a valid JWT token for testing
     * 
     * PURPOSE:
     * Creates an authenticated JWT token that can be used in Authorization headers
     * for protected endpoints. This simulates an authenticated user session.
     * 
     * PARAMETERS:
     * - userId: The ID of the user for whom the token is generated
     * 
     * RETURNS:
     * - String: Valid JWT token
     */
    private String generateValidToken(Long userId) {
        return authService.loginUser(new LoginRequest(TEST_EMAIL, OLD_PASSWORD)).getToken();
    }

    /**
     * Helper method to create a valid (non-expired, unused) reset token
     * 
     * PURPOSE:
     * Generates a password reset token that is valid and ready to be used
     * in reset password tests.
     * 
     * PARAMETERS:
     * - user: The user for whom the token is created
     * 
     * RETURNS:
     * - String: The reset token UUID
     */
    private String createValidResetToken(User user) {
        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(resetToken);
        token.setUser(user);
        token.setExpirationTime(LocalDateTime.now().plusHours(24));
        token.setIsUsed(false);
        token.setCreatedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);
        return resetToken;
    }

    /**
     * Helper method to create an expired reset token
     * 
     * PURPOSE:
     * Generates a password reset token that has already expired.
     * Used to test rejection of expired tokens.
     * 
     * PARAMETERS:
     * - user: The user for whom the token is created
     * 
     * RETURNS:
     * - String: The expired reset token UUID
     */
    private String createExpiredResetToken(User user) {
        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(resetToken);
        token.setUser(user);
        token.setExpirationTime(LocalDateTime.now().minusHours(1)); // Expired 1 hour ago
        token.setIsUsed(false);
        token.setCreatedAt(LocalDateTime.now().minusHours(25));
        passwordResetTokenRepository.save(token);
        return resetToken;
    }

    /**
     * Helper method to create an already used reset token
     * 
     * PURPOSE:
     * Generates a password reset token that has already been used.
     * Used to test rejection of reused tokens.
     * 
     * PARAMETERS:
     * - user: The user for whom the token is created
     * 
     * RETURNS:
     * - String: The used reset token UUID
     */
    private String createUsedResetToken(User user) {
        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(resetToken);
        token.setUser(user);
        token.setExpirationTime(LocalDateTime.now().plusHours(24));
        token.setIsUsed(true); // Already used
        token.setCreatedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);
        return resetToken;
    }
}
