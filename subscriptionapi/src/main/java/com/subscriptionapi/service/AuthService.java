package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.ChangePasswordRequest;
import com.subscriptionapi.dto.ForgotPasswordRequest;
import com.subscriptionapi.dto.ResetPasswordRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.dto.RefreshTokenRequest;

public interface AuthService {
    AuthResponse registerUser(RegisterRequest registerRequest);
    AuthResponse loginUser(LoginRequest loginRequest);
    Long getUserIdFromToken(String token);
    void changePassword(Long userId, ChangePasswordRequest changePasswordRequest);
    void forgotPassword(ForgotPasswordRequest forgotPasswordRequest);
    void resetPassword(ResetPasswordRequest resetPasswordRequest);
    AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest);

}

