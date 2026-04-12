package com.subscriptionapi.controller;

import com.subscriptionapi.dto.SubscriptionCreateRequest;
import com.subscriptionapi.dto.SubscriptionResponseDTO;
import com.subscriptionapi.entity.SubscriptionStatus;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    @GetMapping("/subscription-statuses")
    public ResponseEntity<List<String>> getSubscriptionStatuses() {
        List<String> statuses = Arrays.stream(SubscriptionStatus.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(statuses);
    }

    /**
     * Create new subscription (CUSTOMER only)
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SubscriptionResponseDTO> createSubscription(
            @Valid @RequestBody SubscriptionCreateRequest request) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        
        SubscriptionResponseDTO createdSubscription = subscriptionService.createSubscription(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSubscription);
    }
    
    /**
     * Get subscription by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubscriptionResponseDTO> getSubscriptionById(@PathVariable Long id) {
        SubscriptionResponseDTO subscription = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(subscription);
    }
    
    /**
     * Get all subscriptions for current customer
     */
    @GetMapping("/my-subscriptions")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<SubscriptionResponseDTO>> getMySubscriptions(Pageable pageable) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        
        Page<SubscriptionResponseDTO> subscriptions = subscriptionService.getUserSubscriptions(userId, pageable);
        return ResponseEntity.ok(subscriptions);
    }
    
    /**
     * Get all subscriptions for current operator with optional status filter
     */
    @GetMapping("/operator/subscriptions")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<Page<SubscriptionResponseDTO>> getOperatorSubscriptions(
            @RequestParam(required = false) SubscriptionStatus status,
            Pageable pageable) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long operatorId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        
        Page<SubscriptionResponseDTO> subscriptions;
        
        if (status != null) {
            // Filter by status if provided
            subscriptions = subscriptionService.getOperatorSubscriptionsByStatus(operatorId, status, pageable);
        } else {
            // Get all subscriptions if no status filter
            subscriptions = subscriptionService.getOperatorSubscriptions(operatorId, pageable);
        }
        
        return ResponseEntity.ok(subscriptions);
    }
    
    /**
     * Get pending subscriptions for current operator
     */
    @GetMapping("/operator/pending")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<Page<SubscriptionResponseDTO>> getOperatorPendingSubscriptions(Pageable pageable) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long operatorId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        
        Page<SubscriptionResponseDTO> subscriptions = subscriptionService.getOperatorPendingSubscriptions(operatorId, pageable);
        return ResponseEntity.ok(subscriptions);
    }
    
    /**
     * Get subscriptions by status for current customer
     */
    @GetMapping("/my-subscriptions/status")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<SubscriptionResponseDTO>> getMySubscriptionsByStatus(
            @RequestParam SubscriptionStatus status,
            Pageable pageable) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        
        Page<SubscriptionResponseDTO> subscriptions = subscriptionService.getUserSubscriptionsByStatus(userId, status, pageable);
        return ResponseEntity.ok(subscriptions);
    }
    
    /**
     * Operator: Approve subscription
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<SubscriptionResponseDTO> approveSubscription(@PathVariable Long id) {
        SubscriptionResponseDTO subscription = subscriptionService.approveSubscription(id);
        return ResponseEntity.ok(subscription);
    }
    
    /**
     * Operator: Suspend subscription
     */
    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<SubscriptionResponseDTO> suspendSubscription(@PathVariable Long id) {
        SubscriptionResponseDTO subscription = subscriptionService.suspendSubscription(id);
        return ResponseEntity.ok(subscription);
    }
    
    /**
     * Cancel subscription (CUSTOMER or OPERATOR)
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubscriptionResponseDTO> cancelSubscription(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        SubscriptionResponseDTO subscription = subscriptionService.cancelSubscription(id, reason);
        return ResponseEntity.ok(subscription);
    }

    @GetMapping("/my-subscriptions/search")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<SubscriptionResponseDTO>> searchMySubscriptions(
            @RequestParam String q,
            Pageable pageable) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        
        Page<SubscriptionResponseDTO> subscriptions = subscriptionService.searchUserSubscriptions(userId, q, pageable);
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/my-subscriptions/filter")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<SubscriptionResponseDTO>> filterMySubscriptionsByServiceType(
            @RequestParam String serviceType,
            Pageable pageable) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        
        Page<SubscriptionResponseDTO> subscriptions = subscriptionService.filterUserSubscriptionsByServiceType(userId, serviceType, pageable);
        return ResponseEntity.ok(subscriptions);
    }
}
