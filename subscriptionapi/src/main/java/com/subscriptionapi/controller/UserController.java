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
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(new ProfileResponse("User profile"));
    }
    
    @GetMapping("/users")
    public ResponseEntity<UsersResponse> getUsers() {
        return ResponseEntity.ok(new UsersResponse("Users list"));
    }
    
    @GetMapping("/admin/dashboard")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(new AdminDashboardResponse("Admin dashboard"));
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

class UsersResponse {
    private String message;
    
    public UsersResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}

class AdminDashboardResponse {
    private String message;
    
    public AdminDashboardResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}
