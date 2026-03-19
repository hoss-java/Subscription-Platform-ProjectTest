package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.dto.LoginRequest;

public interface AuthService {
    AuthResponse registerUser(RegisterRequest registerRequest);
    AuthResponse loginUser(LoginRequest loginRequest);
}

