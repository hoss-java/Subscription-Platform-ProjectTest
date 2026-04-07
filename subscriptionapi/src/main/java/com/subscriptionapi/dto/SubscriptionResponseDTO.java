package com.subscriptionapi.dto;

import com.subscriptionapi.entity.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponseDTO {
    private Long id;
    private Long userId;
    private Long planId;
    private Long operatorId;
    private SubscriptionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime endDate;
    private Boolean autoRenewal;
    private LocalDateTime nextRenewalDate;
    private String cancellationReason;
    private LocalDateTime updatedAt;
}
