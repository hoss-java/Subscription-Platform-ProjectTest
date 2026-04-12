package com.subscriptionapi.dto;

import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.entity.ServiceType;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanUpdateRequest {
    
    private String name;
    
    private String description;
    
    private ServiceType serviceType;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private BigDecimal basePrice;
    
    private BillingPeriod billingPeriod;
    
    private String features;
}
