package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.AuthResponse;

public interface AuthService {
    AuthResponse registerUser(RegisterRequest registerRequest);
}
