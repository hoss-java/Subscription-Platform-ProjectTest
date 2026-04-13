package com.subscriptionapi.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class BillingCreateRequestUnitTest {
    
    private static Validator validator;
    
    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }
    
    @Test
    void testValidBillingCreateRequest() {
        BillingCreateRequest request = BillingCreateRequest.builder()
                .subscriptionId(1L)
                .amount(new BigDecimal("100.00"))
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();
        
        Set<ConstraintViolation<BillingCreateRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Valid request should have no violations");
    }
    
    // Add more tests for null checks, amount validation, etc.
}
