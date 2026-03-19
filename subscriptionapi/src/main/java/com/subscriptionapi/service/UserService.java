package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.subscriptionapi.util.PasswordValidator;
import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.dto.LoginRequest;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;
    private final JwtTokenProvider jwtTokenProvider;
    
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        // Add this to the registerUser method after password confirmation check
        if (!passwordValidator.isValidPassword(registerRequest.getPassword())) {
            throw new RuntimeException("Password does not meet strength requirements: " + 
                passwordValidator.getPasswordRequirements());
        }

        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        // Validate password confirmation
        if (!registerRequest.getPassword().equals(registerRequest.getPasswordConfirm())) {
            throw new RuntimeException("Passwords do not match");
        }
        
        // Hash password
        String hashedPassword = passwordEncoder.encode(registerRequest.getPassword());
        
        // Get default CUSTOMER role
        Role customerRole = roleRepository.findByName(RoleType.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Default CUSTOMER role not found"));
        
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
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        // Check if user is active
        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive");
        }
        
        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
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
}
