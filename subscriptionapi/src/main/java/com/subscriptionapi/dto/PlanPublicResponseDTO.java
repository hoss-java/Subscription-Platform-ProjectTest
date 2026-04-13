package com.subscriptionapi.dto;

import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.entity.PlanStatus;
import com.subscriptionapi.entity.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanPublicResponseDTO {
    private Long id;
    private String operatorName;
    private String name;
    private String description;
    private ServiceType serviceType;
    private BigDecimal basePrice;
    private BillingPeriod billingPeriod;
    private String features;
}
