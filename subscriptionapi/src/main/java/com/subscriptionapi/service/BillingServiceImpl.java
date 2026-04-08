package com.subscriptionapi.service;

import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.dto.BillingUpdateRequest;
import com.subscriptionapi.entity.Billing;
import com.subscriptionapi.entity.BillingStatus;
import com.subscriptionapi.entity.Subscription;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.repository.BillingRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {
    
    private final BillingRepository billingRepository;
    private final SubscriptionRepository subscriptionRepository;
    
    @Override
    @Transactional
    public BillingResponseDTO createBilling(BillingCreateRequest request) {
        Subscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        Billing billing = Billing.builder()
            .subscription(subscription)
            .amount(request.getAmount())
            .billingDate(request.getBillingDate())
            .dueDate(request.getDueDate())
            .status(BillingStatus.PENDING)
            .build();
        
        Billing savedBilling = billingRepository.save(billing);
        return mapToResponseDTO(savedBilling);
    }

    @Override
    public BillingResponseDTO getBillingById(Long id) {
        Billing billing = billingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        return mapToResponseDTO(billing);
    }

    @Override
    public BillingResponseDTO getBillingByIdForUser(Long id, Long userId) {
        Billing billing = billingRepository.findByIdAndSubscriptionUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        return mapToResponseDTO(billing);
    }

    @Override
    public List<BillingResponseDTO> getBillingsBySubscription(Long subscriptionId) {
        return billingRepository.findBySubscriptionId(subscriptionId)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Override
    public List<BillingResponseDTO> getBillingsByUser(Long userId) {
        return billingRepository.findBySubscriptionUserIdOrderByBillingDateDesc(userId)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Override
    public List<BillingResponseDTO> getBillingsByStatus(BillingStatus status) {
        return billingRepository.findByStatus(status)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Override
    public List<BillingResponseDTO> getBillingsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return billingRepository.findByBillingDateBetween(startDate, endDate)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Override
    @Transactional
    public BillingResponseDTO updateBillingStatus(Long id, BillingStatus status) {
        Billing billing = billingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        
        billing.setStatus(status);
        if (status == BillingStatus.PAID) {
            billing.setPaidDate(LocalDateTime.now());
        }
        
        Billing updatedBilling = billingRepository.save(billing);
        return mapToResponseDTO(updatedBilling);
    }

    @Override
    @Transactional
    public void deleteBilling(Long id) {
        Billing billing = billingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        billingRepository.delete(billing);
    }

    private BillingResponseDTO mapToResponseDTO(Billing billing) {
        return BillingResponseDTO.builder()
            .id(billing.getId())
            .subscriptionId(billing.getSubscription().getId())
            .amount(billing.getAmount())
            .billingDate(billing.getBillingDate())
            .dueDate(billing.getDueDate())
            .paidDate(billing.getPaidDate())
            .status(billing.getStatus())
            .createdAt(billing.getCreatedAt())
            .updatedAt(billing.getUpdatedAt())
            .build();
    }
}
