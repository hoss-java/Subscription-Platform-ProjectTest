package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.ChangePasswordRequest;
import com.subscriptionapi.dto.ForgotPasswordRequest;
import com.subscriptionapi.dto.ResetPasswordRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.dto.RefreshTokenRequest;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.PasswordResetToken;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.RefreshTokenRepository;
import com.subscriptionapi.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.subscriptionapi.util.PasswordValidator;
import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.exception.UserInactiveException;
import com.subscriptionapi.exception.InvalidCredentialsException;
import com.subscriptionapi.exception.InvalidPasswordException;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.exception.InvalidResetTokenException;
import com.subscriptionapi.exception.EmailAlreadyExistsException;
import com.subscriptionapi.exception.JwtAuthenticationException;
import com.subscriptionapi.exception.UserNotFoundException;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        // Validate password strength
        if (!passwordValidator.isValidPassword(registerRequest.getPassword())) {
            throw new InvalidPasswordException("Password does not meet strength requirements: " + 
                passwordValidator.getPasswordRequirements());
        }

        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        
        // Validate password confirmation
        if (!registerRequest.getPassword().equals(registerRequest.getPasswordConfirm())) {
            throw new InvalidPasswordException("Passwords do not match");
        }
        
        // Hash password
        String hashedPassword = passwordEncoder.encode(registerRequest.getPassword());
        
        // Get default CUSTOMER role
        Role customerRole = roleRepository.findByName(RoleType.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Default CUSTOMER role not found"));
        
        // Create new user
        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);
        
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(hashedPassword)
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .isActive(true)
                .roles(roles)
                .build();
        
        User savedUser = userRepository.save(user);
        
        // Build response
        return AuthResponse.builder()
                .message("User registered successfully")
                .token(null)
                .userDetails(AuthResponse.UserDetails.builder()
                        .id(savedUser.getId())
                        .email(savedUser.getEmail())
                        .firstName(savedUser.getFirstName())
                        .lastName(savedUser.getLastName())
                        .isActive(savedUser.getIsActive())
                        .build())
                .build();
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        
        // Check if user is active
        if (!user.getIsActive()) {
            throw new UserInactiveException("User account is inactive");
        }
        
        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        
        // ✅ DELETE OLD REFRESH TOKENS FIRST
        refreshTokenRepository.deleteByUser(user);
        
        // Generate JWT token and refresh token
        String token = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        // Save refresh token
        jwtTokenProvider.saveRefreshToken(user, refreshToken);
        
        // Build response
        return AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .refreshToken(refreshToken)
                .userDetails(AuthResponse.UserDetails.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .isActive(user.getIsActive())
                        .build())
                .build();
    }

    public void changePassword(Long userId, ChangePasswordRequest changePasswordRequest) {
        // Find user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidPasswordException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Old password is incorrect");
        }
        
        // Validate new password strength
        if (!passwordValidator.isValidPassword(changePasswordRequest.getNewPassword())) {
            throw new InvalidPasswordException("New password does not meet strength requirements: " + 
                passwordValidator.getPasswordRequirements());
        }
        
        // Ensure old and new passwords are different
        if (changePasswordRequest.getOldPassword().equals(changePasswordRequest.getNewPassword())) {
            throw new RuntimeException("New password must be different from old password");
        }
        
        // Hash and update password
        String hashedPassword = passwordEncoder.encode(changePasswordRequest.getNewPassword());
        user.setPassword(hashedPassword);
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
    }

    public void forgotPassword(ForgotPasswordRequest forgotPasswordRequest) {
        // Find user by email
        User user = userRepository.findByEmail(forgotPasswordRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User with this email not found"));
        
        // Check if user is active
        if (!user.getIsActive()) {
            throw new UserInactiveException("User account is inactive");
        }
        
        // Generate reset token
        String resetToken = jwtTokenProvider.generatePasswordResetToken();
        
        // Create password reset token entity
        PasswordResetToken passwordResetToken = PasswordResetToken.builder()
                .token(resetToken)
                .user(user)
                .expirationTime(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build();
        
        // Save reset token
        passwordResetTokenRepository.save(passwordResetToken);
        
        // Send reset email (implement email service)
        // emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
        // Find reset token
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(resetPasswordRequest.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid reset token"));
        
        // Check if token is already used
        if (passwordResetToken.getIsUsed()) {
            throw new InvalidResetTokenException("Reset token has already been used");
        }
        
        // Check if token is expired
        if (LocalDateTime.now().isAfter(passwordResetToken.getExpirationTime())) {
            throw new InvalidResetTokenException("Reset token has expired");
        }
        
        // Get user from token
        User user = passwordResetToken.getUser();
        
        // Validate new password strength
        if (!passwordValidator.isValidPassword(resetPasswordRequest.getNewPassword())) {
            throw new InvalidResetTokenException("New password does not meet strength requirements: " + 
                passwordValidator.getPasswordRequirements());
        }
        
        // Hash and update password
        String hashedPassword = passwordEncoder.encode(resetPasswordRequest.getNewPassword());
        user.setPassword(hashedPassword);
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
        
        // Mark token as used
        passwordResetToken.setIsUsed(true);
        passwordResetTokenRepository.save(passwordResetToken);
    }

    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        if (!jwtTokenProvider.isRefreshTokenValid(refreshTokenRequest.getRefreshToken())) {
            throw new JwtAuthenticationException("Invalid or expired refresh token");
        }
        
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshTokenRequest.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        String newAccessToken = jwtTokenProvider.generateToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        jwtTokenProvider.saveRefreshToken(user, newRefreshToken);
        
        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .message("Token refreshed successfully")
                .build();
    }
}
