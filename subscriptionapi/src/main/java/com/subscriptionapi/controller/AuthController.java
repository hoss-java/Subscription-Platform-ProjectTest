package com.subscriptionapi.controller;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.dto.ChangePasswordRequest;
import com.subscriptionapi.dto.ForgotPasswordRequest;
import com.subscriptionapi.dto.ResetPasswordRequest;
import com.subscriptionapi.dto.RefreshTokenRequest;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.exception.UserNotFoundException;
import com.subscriptionapi.exception.UserInactiveException;


import com.subscriptionapi.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.dto.TokenValidationResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping(value = "/register", 
                 produces = {"application/json", "text/plain"})
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.registerUser(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/login", 
                 produces = {"application/json", "text/plain"})
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.loginUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @RequestHeader("Authorization") String token) {
        
        return ResponseEntity.ok(TokenValidationResponse.builder()
                .valid(true)
                .message("Token is valid")
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            @RequestHeader("Authorization") String token) {
        
        Long userId = authService.getUserIdFromToken(token);
        authService.changePassword(userId, changePasswordRequest);
        
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Password changed successfully")
                .token(null)
                .build());
    }

    @PostMapping("/forgot-password")  // Should be exactly this
    public ResponseEntity<AuthResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        authService.forgotPassword(forgotPasswordRequest);
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Password reset link has been sent to your email")
                .token(null)
                .build());
    }


    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        
        authService.resetPassword(resetPasswordRequest);
        
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Password has been reset successfully")
                .token(null)
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        AuthResponse response = authService.refreshToken(refreshTokenRequest);
        return ResponseEntity.ok(response);
    }
}
