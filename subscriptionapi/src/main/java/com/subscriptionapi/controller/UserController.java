package com.subscriptionapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {
    
    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(new ProfileResponse("User profile"));
    }
}

// DTOs
class ProfileResponse {
    private String message;
    
    public ProfileResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}
