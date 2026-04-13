package com.subscriptionapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/operator")
@RequiredArgsConstructor
public class OperatorController {
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<OperatorDashboardResponse> getOperatorDashboard() {
        return ResponseEntity.ok(new OperatorDashboardResponse("Operator dashboard"));
    }
    
    @GetMapping("/plans")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<OperatorPlansResponse> getOperatorPlans() {
        return ResponseEntity.ok(new OperatorPlansResponse("Operator plans"));
    }
}

// DTOs
class OperatorDashboardResponse {
    private String message;
    
    public OperatorDashboardResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}

class OperatorPlansResponse {
    private String message;
    
    public OperatorPlansResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}
