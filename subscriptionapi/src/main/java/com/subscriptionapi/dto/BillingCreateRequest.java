package com.subscriptionapi.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingCreateRequest {
    @NotNull(message = "Subscription ID cannot be null")
    private Long subscriptionId;
    
    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotNull(message = "Billing date cannot be null")
    private LocalDateTime billingDate;
    
    @NotNull(message = "Due date cannot be null")
    private LocalDateTime dueDate;
}
