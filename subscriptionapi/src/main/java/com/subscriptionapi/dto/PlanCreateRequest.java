package com.subscriptionapi.dto;

import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.entity.ServiceType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanCreateRequest {
    
    @NotBlank(message = "Plan name cannot be blank")
    private String name;
    
    @NotBlank(message = "Description cannot be blank")
    private String description;
    
    @NotNull(message = "Service type cannot be null")
    private ServiceType serviceType;
    
    @NotNull(message = "Base price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private BigDecimal basePrice;
    
    @NotNull(message = "Billing period cannot be null")
    private BillingPeriod billingPeriod;
    
    private String features;
}
