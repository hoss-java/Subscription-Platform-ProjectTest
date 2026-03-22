package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.dto.ChangePasswordRequest;
import com.subscriptionapi.dto.ForgotPasswordRequest;
import com.subscriptionapi.dto.ResetPasswordRequest;

import com.subscriptionapi.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        return userService.registerUser(registerRequest);
    }

    @Override
    public AuthResponse loginUser(LoginRequest loginRequest) {
        return userService.loginUser(loginRequest);
    }

    @Override
    public Long getUserIdFromToken(String token) {
        // Remove "Bearer " prefix if present
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        
        return jwtTokenProvider.getUserIdFromToken(jwt);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest changePasswordRequest) {
        userService.changePassword(userId, changePasswordRequest);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest forgotPasswordRequest) {
        userService.forgotPassword(forgotPasswordRequest); // throws ResourceNotFoundException
    }

    @Override
    public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
        userService.resetPassword(resetPasswordRequest); // throws ResourceNotFoundException
    }
}

