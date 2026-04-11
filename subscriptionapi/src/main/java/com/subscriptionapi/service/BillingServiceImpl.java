package com.subscriptionapi.service;

import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.dto.BillingUpdateRequest;
import com.subscriptionapi.dto.BillingInvoiceDTO;
import com.subscriptionapi.dto.PlanResponseDTO;
import com.subscriptionapi.dto.SubscriptionResponseDTO;
import com.subscriptionapi.dto.UserBasicDTO;
import com.subscriptionapi.entity.Billing;
import com.subscriptionapi.entity.BillingStatus;
import com.subscriptionapi.entity.Subscription;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Plan;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.exception.UnauthorizedException;
import com.subscriptionapi.repository.BillingRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    public BillingResponseDTO updateBillingStatus(Long id, BillingStatus status, Long userId) {
        Billing billing = billingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        
        // Check if user owns this billing
        if (!billing.getSubscription().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You cannot update this billing");
        }
        
        billing.setStatus(status);
        if (status == BillingStatus.PAID) {
            billing.setPaidDate(LocalDateTime.now());
        }
        
        Billing updatedBilling = billingRepository.save(billing);
        return mapToResponseDTO(updatedBilling);
    }

    @Override
    @Transactional
    public void deleteBilling(Long id, Long userId) {
        Billing billing = billingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        
        // Check if user owns the subscription or is the operator
        if (!billing.getSubscription().getUser().getId().equals(userId) && 
            !billing.getSubscription().getOperator().getId().equals(userId)) {
            throw new AccessDeniedException("You cannot delete this billing");
        }
        
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

    @Override
    public List<BillingResponseDTO> getBillingIssuedByOperator(Long operatorId, String status) {
        System.out.println("=== GET BILLINGS ISSUED BY OPERATOR ===");
        System.out.println("Operator ID: " + operatorId);
        System.out.println("Status Filter: " + status);
        
        List<Billing> billings = billingRepository.findBySubscriptionPlanUserId(operatorId);
        System.out.println("Billings found: " + billings.size());
        
        // Apply status filter if provided
        if (status != null && !status.isEmpty()) {
            billings = billings.stream()
                .filter(b -> b.getStatus().toString().equals(status))
                .collect(Collectors.toList());
            System.out.println("Billings after status filter: " + billings.size());
        }
        
        return billings.stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Override
    public List<BillingResponseDTO> getBillingsByUserWithFilters(
            Long userId, Long subscriptionId, String status) {
        List<Billing> billings = billingRepository.findBySubscriptionUserIdOrderByBillingDateDesc(userId);
        
        if (subscriptionId != null) {
            billings = billings.stream()
                .filter(b -> b.getSubscription().getId().equals(subscriptionId))
                .collect(Collectors.toList());
        }
        
        if (status != null && !status.isEmpty()) {
            billings = billings.stream()
                .filter(b -> b.getStatus().toString().equals(status))
                .collect(Collectors.toList());
        }
        
        return billings.stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Override
    public BillingInvoiceDTO getBillingByIdForUserOrOperator(Long id, Long userId) {
        Billing billing = billingRepository.findByIdAndSubscriptionUserIdOrSubscriptionOperatorId(id, userId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        return mapToInvoiceDTO(billing);
    }

    @Override
    @Transactional
    public BillingResponseDTO approveBillingPayment(Long id, Long operatorId) {
        Billing billing = billingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Billing not found"));
        
        // Verify operator owns this subscription
        if (!billing.getSubscription().getOperator().getId().equals(operatorId)) {
            throw new UnauthorizedException("You can only approve billings you issued");
        }
        
        // Only approve if status is PAYMENT_CLAIMED
        if (billing.getStatus() != BillingStatus.PAYMENT_CLAIMED) {
            throw new IllegalStateException("Can only approve billings with PAYMENT_CLAIMED status");
        }
        
        billing.setStatus(BillingStatus.PAID);
        billing.setPaidDate(LocalDateTime.now());
        Billing updated = billingRepository.save(billing);
        return mapToResponseDTO(updated);
    }

    @Override
    public List<BillingResponseDTO> getBillingsByCustomer(Long customerId, String status) {
        List<Billing> billings = billingRepository.findBySubscriptionUserIdOrderByBillingDateDesc(customerId);
        
        if (status != null && !status.isEmpty()) {
            billings = billings.stream()
                .filter(b -> b.getStatus().toString().equals(status))
                .collect(Collectors.toList());
        }
        
        return billings.stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    private BillingInvoiceDTO mapToInvoiceDTO(Billing billing) {
        return BillingInvoiceDTO.builder()
            .id(billing.getId())
            .amount(billing.getAmount())
            .billingDate(billing.getBillingDate())
            .dueDate(billing.getDueDate())
            .paidDate(billing.getPaidDate())
            .status(billing.getStatus())
            .customer(mapUserToBasicDTO(billing.getSubscription().getUser()))
            .operator(mapUserToBasicDTO(billing.getSubscription().getOperator()))
            .plan(mapPlanToDTO(billing.getSubscription().getPlan()))
            .subscription(mapSubscriptionToDTO(billing.getSubscription()))
            .createdAt(billing.getCreatedAt())
            .updatedAt(billing.getUpdatedAt())
            .build();
    }

    private UserBasicDTO mapUserToBasicDTO(User user) {
        return UserBasicDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .build();
    }

    private PlanResponseDTO mapPlanToDTO(Plan plan) {
        return PlanResponseDTO.builder()
            .id(plan.getId())
            .userId(plan.getUser().getId())
            .name(plan.getName())
            .description(plan.getDescription())
            .serviceType(plan.getServiceType())
            .basePrice(plan.getBasePrice())
            .billingPeriod(plan.getBillingPeriod())
            .features(plan.getFeatures())
            .status(plan.getStatus())
            .createdAt(plan.getCreatedAt())
            .updatedAt(plan.getUpdatedAt())
            .build();
    }

    private SubscriptionResponseDTO mapSubscriptionToDTO(Subscription subscription) {
        return SubscriptionResponseDTO.builder()
            .id(subscription.getId())
            .userId(subscription.getUser().getId())
            .planId(subscription.getPlan().getId())
            .operatorId(subscription.getOperator().getId())
            .customerName(subscription.getUser().getFirstName() + " " + subscription.getUser().getLastName())
            .planName(subscription.getPlan().getName())
            .status(subscription.getStatus())
            .createdAt(subscription.getCreatedAt())
            .endDate(subscription.getEndDate())
            .autoRenewal(subscription.getAutoRenewal())
            .nextRenewalDate(subscription.getNextRenewalDate())
            .cancellationReason(subscription.getCancellationReason())
            .updatedAt(subscription.getUpdatedAt())
            .build();
    }
}
