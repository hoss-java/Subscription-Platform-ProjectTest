package com.subscriptionapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(new AdminDashboardResponse("Admin dashboard"));
    }
    
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUsersResponse> getUsers() {
        return ResponseEntity.ok(new AdminUsersResponse("Admin users management"));
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

class AdminUsersResponse {
    private String message;
    
    public AdminUsersResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}
