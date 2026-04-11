package com.subscriptionapi.dto;

import com.subscriptionapi.entity.BillingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingUpdateRequest {
    @NotNull(message = "Status cannot be null")
    private BillingStatus status;
    
    private LocalDateTime paidDate;
}

