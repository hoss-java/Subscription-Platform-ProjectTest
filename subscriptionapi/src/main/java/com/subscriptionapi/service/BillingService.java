package com.subscriptionapi.service;

import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.entity.BillingStatus;
import java.time.LocalDateTime;
import java.util.List;

public interface BillingService {
    
    BillingResponseDTO createBilling(BillingCreateRequest request);
    
    BillingResponseDTO getBillingById(Long id);
    
    BillingResponseDTO getBillingByIdForUser(Long id, Long userId);
    
    List<BillingResponseDTO> getBillingsBySubscription(Long subscriptionId);
    
    List<BillingResponseDTO> getBillingsByUser(Long userId);
    
    List<BillingResponseDTO> getBillingsByStatus(BillingStatus status);
    
    List<BillingResponseDTO> getBillingsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    BillingResponseDTO updateBillingStatus(Long id, BillingStatus status);
    
    void deleteBilling(Long id);
}
