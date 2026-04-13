package com.subscriptionapi.util;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
    
    private final boolean isDevMode;
    
    public PasswordValidator() {
        // Check if dev profile is active
        String activeProfiles = System.getProperty("spring.profiles.active", "");
        this.isDevMode = activeProfiles.contains("dev");
    }
    
    public boolean isValidPassword(String password) {
        if (isDevMode) {
            // Dev mode: Accept any non-empty password with minimum 6 characters
            return password != null && password.length() >= 6;
        } else {
            // Production mode: Strict validation
            if (password == null || password.length() < MIN_LENGTH) {
                return false;
            }
            return pattern.matcher(password).matches();
        }
    }
    
    public String getPasswordRequirements() {
        if (isDevMode) {
            return "Password must be at least 6 characters long (Dev Mode)";
        } else {
            return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)";
        }
    }
}
