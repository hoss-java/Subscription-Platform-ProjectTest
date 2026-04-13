package com.subscriptionapi.dto;

import com.subscriptionapi.entity.BillingStatus;
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
public class BillingInvoiceDTO {
    private Long id;
    private BigDecimal amount;
    private LocalDateTime billingDate;
    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private BillingStatus status;
    
    // Subscription details
    private SubscriptionResponseDTO subscription;
    
    // Customer details
    private UserBasicDTO customer;
    
    // Operator details
    private UserBasicDTO operator;
    
    // Plan details
    private PlanResponseDTO plan;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
