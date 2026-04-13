package com.subscriptionapi.dto;

import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.entity.PlanStatus;
import com.subscriptionapi.entity.ServiceType;
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
public class PlanResponseDTO {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private ServiceType serviceType;
    private BigDecimal basePrice;
    private BillingPeriod billingPeriod;
    private String features;
    private PlanStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
