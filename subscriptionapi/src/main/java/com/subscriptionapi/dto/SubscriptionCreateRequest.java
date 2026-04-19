package com.subscriptionapi.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionCreateRequest {
    
    @NotNull(message = "Plan ID cannot be null")
    private Long planId;
    
    @Builder.Default
    private Boolean autoRenewal = true;
}
