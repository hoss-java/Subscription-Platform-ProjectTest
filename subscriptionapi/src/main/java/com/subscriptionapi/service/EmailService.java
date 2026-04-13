package com.subscriptionapi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public void sendPasswordResetEmail(String email, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        
        // Mock implementation - just log the email
        log.info("Password reset email sent to: {}", email);
        log.info("Reset link: {}", resetLink);
        
        // TODO: Implement real email sending using JavaMailSender
        // Example: mailSender.send(message);
    }
    
    public void sendWelcomeEmail(String email, String firstName) {
        log.info("Welcome email sent to: {} ({})", email, firstName);
        
        // TODO: Implement real email sending
    }
}
