package com.subscriptionapi.dto;

import com.subscriptionapi.entity.BillingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingResponseDTO {
    private Long id;
    private Long subscriptionId;
    private BigDecimal amount;
    private LocalDateTime billingDate;
    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private BillingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
