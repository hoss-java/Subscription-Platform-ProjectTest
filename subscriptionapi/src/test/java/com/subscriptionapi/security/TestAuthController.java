package com.subscriptionapi.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class TestAuthController {

    @GetMapping("/login")
    public ResponseEntity<?> login() {
        return ResponseEntity.ok("Login");
    }

    @GetMapping("/register")
    public ResponseEntity<?> register() {
        return ResponseEntity.ok("Register");
    }
}
