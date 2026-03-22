package com.subscriptionapi.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Password Validator Unit Tests")
public class PasswordValidatorUnitTest {
    
    private final PasswordValidator passwordValidator = new PasswordValidator();
    
    // ===== Valid Passwords =====
    
    @ParameterizedTest
    @DisplayName("Should accept valid passwords")
    @ValueSource(strings = {
        "Password123!",
        "SecurePass@2024",
        "MyP@ssw0rd",
        "Test1234$abc",
        "Complex!Pass99",
        "VeryLongPasswordWith123@Special"
    })
    public void testValidPasswords(String password) {
        assertTrue(passwordValidator.isValidPassword(password));
    }
    
    // ===== Invalid Passwords =====
    
    @ParameterizedTest
    @DisplayName("Should reject invalid passwords")
    @CsvSource({
        "password123!,          missing uppercase",
        "PASSWORD123!,          missing lowercase",
        "Password!,             missing digit",
        "Password123,           missing special character",
        "Pass12!,               too short",
        "PASS@1,                too short and missing lowercase",
        "null,                  null password",
        "'',                    empty password",
        "'        ',            only spaces"
    })
    public void testInvalidPasswords(String password, String reason) {
        boolean result = "null".equals(password) ? 
            passwordValidator.isValidPassword(null) : 
            passwordValidator.isValidPassword(password);
        
        assertFalse(result, "Should reject password: " + reason);
    }
    
    // ===== Allowed Special Characters =====
    
    @ParameterizedTest
    @DisplayName("Should accept all allowed special characters")
    @ValueSource(strings = {
        "Password123@",
        "Password123$",
        "Password123!",
        "Password123%",
        "Password123*",
        "Password123?",
        "Password123&"
    })
    public void testAllowedSpecialCharacters(String password) {
        assertTrue(passwordValidator.isValidPassword(password));
    }
    
    // ===== Disallowed Special Characters =====
    
    @ParameterizedTest
    @DisplayName("Should reject disallowed special characters")
    @ValueSource(strings = {
        "Password123#",
        "Password123^",
        "Password123~",
        "Password123-"
    })
    public void testDisallowedSpecialCharacters(String password) {
        assertFalse(passwordValidator.isValidPassword(password));
    }
    
    // ===== Password Requirements Message =====
    
    @Test
    @DisplayName("Should return correct password requirements message")
    public void testPasswordRequirementsMessage() {
        String requirements = passwordValidator.getPasswordRequirements();
        
        assertNotNull(requirements);
        assertFalse(requirements.isEmpty());
        assertTrue(requirements.contains("8 characters"));
        assertTrue(requirements.contains("uppercase"));
        assertTrue(requirements.contains("lowercase"));
        assertTrue(requirements.contains("digit"));
        assertTrue(requirements.contains("special character"));
    }
}
