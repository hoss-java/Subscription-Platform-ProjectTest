package com.subscriptionapi.service;

import com.subscriptionapi.dto.ChangePasswordRequest;
import com.subscriptionapi.dto.ForgotPasswordRequest;
import com.subscriptionapi.dto.ResetPasswordRequest;
import com.subscriptionapi.entity.PasswordResetToken;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.exception.InvalidPasswordException;
import com.subscriptionapi.exception.UserInactiveException;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.PasswordResetTokenRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.util.PasswordValidator;
import com.subscriptionapi.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================================
 * USER SERVICE PASSWORD UNIT TEST SUITE
 * ============================================================================
 * 
 * This test class validates password change and reset functionality, including:
 * - Successful password changes with valid credentials
 * - Password reset token generation and validation
 * - Token expiration and single-use enforcement
 * - Password strength validation
 * - Error handling for various failure scenarios
 * 
 * Test Organization:
 * 1. Setup Phase: Initialize test data and dependencies
 * 2. Change Password Tests: Verify password change scenarios
 * 3. Forgot Password Tests: Verify reset token generation
 * 4. Reset Password Tests: Verify token validation and password update
 * 5. Helper Methods: Centralized test data creation
 * 
 * ============================================================================
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("User Service Password Integration Tests")
public class UserServicePasswordIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private PasswordValidator passwordValidator;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    private User testUser;
    private Role customerRole;
    private static final String VALID_PASSWORD = "ValidPassword123!";
    private static final String NEW_PASSWORD = "NewPassword456!";
    
    @BeforeEach
    public void setUp() {
        userRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        // Don't delete roles - they're managed by initializers
        
        // Query for the existing CUSTOMER role instead of creating it
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
        
        testUser = User.builder()
                .email("test@example.com")
                .password(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("Test")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>())
                .build();
        testUser.getRoles().add(customerRole);
        testUser = userRepository.save(testUser);
    }

    // ============================================================================
    // SECTION 1: CHANGE PASSWORD TESTS - SUCCESSFUL SCENARIOS
    // ============================================================================
    
    @ParameterizedTest(name = "Password: {0} - Should {1}")
    @DisplayName("Should validate password strength correctly")
    @CsvSource({
        "NewSecure@Pass123, PASS",
        "AnotherValid$Pass456, PASS",
        "ComplexP@ssw0rd789!, PASS",
        "MyNewP@ssw0rd2024!, PASS",
        "weak, FAIL",
        "NoSpecial123, FAIL",
        "NoDigit@Pass, FAIL",
        "nouppercase@123, FAIL",
        "NOLOWERCASE@123, FAIL",
        "Short@1, FAIL"
    })
    public void testChangePasswordWithStrengthValidation(String newPassword, String expectedResult) {
        ChangePasswordRequest request = new ChangePasswordRequest(VALID_PASSWORD, newPassword);
        
        if ("PASS".equals(expectedResult)) {
            userService.changePassword(testUser.getId(), request);
            User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
            assertTrue(passwordEncoder.matches(newPassword, updatedUser.getPassword()));
        } else {
            assertThrows(InvalidPasswordException.class, () -> 
                userService.changePassword(testUser.getId(), request)
            );
        }
    }
    
    // ============================================================================
    // SECTION 2: CHANGE PASSWORD TESTS - FAILURE SCENARIOS
    // ============================================================================
    
    @Test
    @DisplayName("Should throw exception when old password is incorrect")
    public void testChangePasswordWithWrongOldPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest("WrongPassword123!", NEW_PASSWORD);
        
        assertThrows(InvalidPasswordException.class, 
            () -> userService.changePassword(testUser.getId(), request));
    }
    
    @Test
    @DisplayName("Should throw exception when new password equals old password")
    public void testChangePasswordWithSamePassword() {
        ChangePasswordRequest request = new ChangePasswordRequest(VALID_PASSWORD, VALID_PASSWORD);
        
        assertThrows(RuntimeException.class, 
            () -> userService.changePassword(testUser.getId(), request));
    }
    
    @ParameterizedTest(name = "Change password with weak password: {0}")
    @DisplayName("Should throw exception for weak new passwords")
    @ValueSource(strings = {
            "weak",
            "123456",
            "password",
            "abc"
    })
    public void testChangePasswordWithWeakPassword(String weakPassword) {
        ChangePasswordRequest request = new ChangePasswordRequest(VALID_PASSWORD, weakPassword);
        
        assertThrows(RuntimeException.class, 
            () -> userService.changePassword(testUser.getId(), request));
    }
    
    @Test
    @DisplayName("Should throw exception when user not found")
    public void testChangePasswordUserNotFound() {
        ChangePasswordRequest request = new ChangePasswordRequest(VALID_PASSWORD, NEW_PASSWORD);
        
        assertThrows(RuntimeException.class, 
            () -> userService.changePassword(9999L, request));
    }
    
    // ============================================================================
    // SECTION 3: FORGOT PASSWORD TESTS - SUCCESSFUL SCENARIOS
    // ============================================================================
    
    @Test
    @DisplayName("Should generate reset token for valid email")
    public void testForgotPasswordSuccess() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("test@example.com");
        
        userService.forgotPassword(request);
        
        Optional<PasswordResetToken> token = passwordResetTokenRepository
                .findByUserAndIsUsedFalse(testUser);
        assertTrue(token.isPresent());
        assertFalse(token.get().getIsUsed());
        assertTrue(LocalDateTime.now().isBefore(token.get().getExpirationTime()));
    }
    
    @ParameterizedTest(name = "Forgot password for email: {0}")
    @DisplayName("Should generate reset token for various user emails")
    @CsvSource({
            "forgot1@example.com",
            "forgot2@test.com",
            "forgot3@company.com"
    })
    public void testForgotPasswordWithVariousEmails(String email) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(VALID_PASSWORD))
                .firstName("Test")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>())
                .build();
        user.getRoles().add(customerRole);
        user = userRepository.save(user);
        
        ForgotPasswordRequest request = new ForgotPasswordRequest(email);
        userService.forgotPassword(request);
        
        Optional<PasswordResetToken> token = passwordResetTokenRepository
                .findByUserAndIsUsedFalse(user);
        assertTrue(token.isPresent());
    }

    // ============================================================================
    // SECTION 4: FORGOT PASSWORD TESTS - FAILURE SCENARIOS
    // ============================================================================
    
    @Test
    @DisplayName("Should throw exception for non-existent email")
    public void testForgotPasswordUserNotFound() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("nonexistent@example.com");
        
        assertThrows(RuntimeException.class, 
            () -> userService.forgotPassword(request));
    }
    
    @Test
    @DisplayName("Should throw exception for inactive user")
    public void testForgotPasswordInactiveUser() {
        testUser.setIsActive(false);
        userRepository.save(testUser);
        
        ForgotPasswordRequest request = new ForgotPasswordRequest("test@example.com");
        
        assertThrows(UserInactiveException.class, 
            () -> userService.forgotPassword(request));
    }
    
    // ============================================================================
    // SECTION 5: RESET PASSWORD TESTS - SUCCESSFUL SCENARIOS
    // ============================================================================
    
    @Test
    @DisplayName("Should reset password successfully with valid token")
    public void testResetPasswordSuccess() {
        // Generate reset token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token("valid-reset-token-123")
                .user(testUser)
                .expirationTime(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build();
        passwordResetTokenRepository.save(resetToken);
        
        ResetPasswordRequest request = new ResetPasswordRequest("valid-reset-token-123", NEW_PASSWORD);
        userService.resetPassword(request);
        
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches(NEW_PASSWORD, updatedUser.getPassword()));
        
        PasswordResetToken usedToken = passwordResetTokenRepository
                .findByToken("valid-reset-token-123").orElseThrow();
        assertTrue(usedToken.getIsUsed());
    }
    
    @ParameterizedTest(name = "Reset password with new password: {0}")
    @DisplayName("Should reset password with various valid new passwords")
    @ValueSource(strings = {
            "ResetPass@123",
            "NewSecure$Pass456",
            "ComplexReset@789!",
            "MyReset@Pass2024!"
    })

    public void testResetPasswordWithVariousPasswords(String newPassword) {
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token("token-" + newPassword)
                .user(testUser)
                .expirationTime(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build();
        passwordResetTokenRepository.save(resetToken);
        
        ResetPasswordRequest request = new ResetPasswordRequest("token-" + newPassword, newPassword);
        userService.resetPassword(request);
        
        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches(newPassword, updatedUser.getPassword()));
    }
    
    // ============================================================================
    // SECTION 6: RESET PASSWORD TESTS - FAILURE SCENARIOS
    // ============================================================================
    
    @Test
    @DisplayName("Should throw exception for invalid token")
    public void testResetPasswordInvalidToken() {
        ResetPasswordRequest request = new ResetPasswordRequest("invalid-token", NEW_PASSWORD);
        
        assertThrows(RuntimeException.class, 
            () -> userService.resetPassword(request));
    }
    
    @Test
    @DisplayName("Should throw exception for expired token")
    public void testResetPasswordExpiredToken() {
        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .token("expired-token")
                .user(testUser)
                .expirationTime(LocalDateTime.now().minusHours(1))
                .isUsed(false)
                .build();
        passwordResetTokenRepository.save(expiredToken);
        
        ResetPasswordRequest request = new ResetPasswordRequest("expired-token", NEW_PASSWORD);
        
        assertThrows(RuntimeException.class, 
            () -> userService.resetPassword(request));
    }
    
    @Test
    @DisplayName("Should throw exception for already used token")
    public void testResetPasswordAlreadyUsedToken() {
        PasswordResetToken usedToken = PasswordResetToken.builder()
                .token("used-token")
                .user(testUser)
                .expirationTime(LocalDateTime.now().plusHours(24))
                .isUsed(true)
                .build();
        passwordResetTokenRepository.save(usedToken);
        
        ResetPasswordRequest request = new ResetPasswordRequest("used-token", NEW_PASSWORD);
        
        assertThrows(RuntimeException.class, 
            () -> userService.resetPassword(request));
    }
    
    @ParameterizedTest(name = "Reset password with weak password: {0}")
    @DisplayName("Should throw exception for weak passwords during reset")
    @ValueSource(strings = {
            "weak",
            "123456",
            "password",
            "abc"
    })
    public void testResetPasswordWithWeakPassword(String weakPassword) {
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token("valid-token")
                .user(testUser)
                .expirationTime(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build();
        passwordResetTokenRepository.save(resetToken);
        
        ResetPasswordRequest request = new ResetPasswordRequest("valid-token", weakPassword);
        
        assertThrows(RuntimeException.class, 
            () -> userService.resetPassword(request));
    }
}
