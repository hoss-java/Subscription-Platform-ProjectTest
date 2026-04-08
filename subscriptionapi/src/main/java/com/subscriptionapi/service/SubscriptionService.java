package com.subscriptionapi.service;

import com.subscriptionapi.dto.SubscriptionCreateRequest;
import com.subscriptionapi.dto.SubscriptionResponseDTO;
import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.entity.Plan;
import com.subscriptionapi.entity.Subscription;
import com.subscriptionapi.entity.SubscriptionStatus;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.repository.PlanRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.service.BillingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {
    
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final BillingService billingService;
    
    @Transactional
    public SubscriptionResponseDTO createSubscription(Long userId, SubscriptionCreateRequest request) {
        log.info("Creating subscription for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        
        User operator = plan.getUser();
        
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .operator(operator)
                .status(SubscriptionStatus.PENDING)
                .autoRenewal(request.getAutoRenewal())
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
        
        Subscription savedSubscription = subscriptionRepository.save(subscription);
        log.info("Subscription created with ID: {}", savedSubscription.getId());
        
        return mapToDTO(savedSubscription);
    }
    
    public SubscriptionResponseDTO getSubscriptionById(Long subscriptionId) {
        log.debug("Fetching subscription ID: {}", subscriptionId);
        
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        return mapToDTO(subscription);
    }
    
    public Page<SubscriptionResponseDTO> getUserSubscriptions(Long userId, Pageable pageable) {
        log.debug("Fetching subscriptions for user ID: {}", userId);
        
        return subscriptionRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
    }
    
    public Page<SubscriptionResponseDTO> getOperatorSubscriptions(Long operatorId, Pageable pageable) {
        log.debug("Fetching subscriptions for operator ID: {}", operatorId);
        
        return subscriptionRepository.findByOperatorId(operatorId, pageable)
                .map(this::mapToDTO);
    }
    
    public Page<SubscriptionResponseDTO> getOperatorPendingSubscriptions(Long operatorId, Pageable pageable) {
        log.debug("Fetching pending subscriptions for operator ID: {}", operatorId);
        
        return subscriptionRepository.findByOperatorIdAndStatus(operatorId, SubscriptionStatus.PENDING, pageable)
                .map(this::mapToDTO);
    }
    
    public Page<SubscriptionResponseDTO> getUserSubscriptionsByStatus(Long userId, SubscriptionStatus status, Pageable pageable) {
        log.debug("Fetching subscriptions for user ID: {} with status: {}", userId, status);
        
        return subscriptionRepository.findByUserIdAndStatus(userId, status, pageable)
                .map(this::mapToDTO);
    }
    
    @Transactional
    public SubscriptionResponseDTO approveSubscription(Long subscriptionId) {
        log.info("Approving subscription ID: {}", subscriptionId);
        
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setUpdatedAt(LocalDateTime.now());
        
        Subscription updatedSubscription = subscriptionRepository.save(subscription);
        
        // Generate first billing when subscription is approved
        generateFirstBilling(updatedSubscription);
        
        log.info("Subscription approved");
        
        return mapToDTO(updatedSubscription);
    }
    
    @Transactional
    public SubscriptionResponseDTO suspendSubscription(Long subscriptionId) {
        log.info("Suspending subscription ID: {}", subscriptionId);
        
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        subscription.setStatus(SubscriptionStatus.SUSPENDED);
        subscription.setUpdatedAt(LocalDateTime.now());
        
        Subscription updatedSubscription = subscriptionRepository.save(subscription);
        log.info("Subscription suspended");
        
        return mapToDTO(updatedSubscription);
    }
    
    @Transactional
    public SubscriptionResponseDTO cancelSubscription(Long subscriptionId, String cancellationReason) {
        log.info("Canceling subscription ID: {}", subscriptionId);
        
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        
        subscription.setStatus(SubscriptionStatus.CANCELED);
        subscription.setCancellationReason(cancellationReason);
        subscription.setUpdatedAt(LocalDateTime.now());
        
        Subscription updatedSubscription = subscriptionRepository.save(subscription);
        log.info("Subscription canceled");
        
        return mapToDTO(updatedSubscription);
    }
    
    private SubscriptionResponseDTO mapToDTO(Subscription subscription) {
        return SubscriptionResponseDTO.builder()
                .id(subscription.getId())
                .userId(subscription.getUser().getId())
                .planId(subscription.getPlan().getId())
                .operatorId(subscription.getOperator().getId())
                .customerName(subscription.getUser().getName())  // or getFullName() depending on User entity
                .planName(subscription.getPlan().getName())      // or getTitle() depending on Plan entity
                .status(subscription.getStatus())
                .createdAt(subscription.getCreatedAt())
                .endDate(subscription.getEndDate())
                .autoRenewal(subscription.getAutoRenewal())
                .nextRenewalDate(subscription.getNextRenewalDate())
                .cancellationReason(subscription.getCancellationReason())
                .updatedAt(subscription.getUpdatedAt())
                .build();
    }

    public Page<SubscriptionResponseDTO> getOperatorSubscriptionsByStatus(Long operatorId, SubscriptionStatus status, Pageable pageable) {
        log.debug("Fetching subscriptions for operator ID: {} with status: {}", operatorId, status);
        
        return subscriptionRepository.findByOperatorIdAndStatus(operatorId, status, pageable)
                .map(this::mapToDTO);
    }

    private void generateFirstBilling(Subscription subscription) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime dueDate = now.plusDays(15);
            
            BillingCreateRequest billingRequest = BillingCreateRequest.builder()
                    .subscriptionId(subscription.getId())
                    .amount(subscription.getPlan().getBasePrice())
                    .billingDate(now)
                    .dueDate(dueDate)
                    .build();
            
            billingService.createBilling(billingRequest);
            log.info("First billing created for subscription ID: {}", subscription.getId());
        } catch (Exception e) {
            log.error("Error creating first billing for subscription ID: {}", subscription.getId(), e);
        }
    }

}
