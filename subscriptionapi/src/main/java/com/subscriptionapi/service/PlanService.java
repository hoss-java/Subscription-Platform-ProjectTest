package com.subscriptionapi.service;

import com.subscriptionapi.dto.PlanCreateRequest;
import com.subscriptionapi.dto.PlanResponseDTO;
import com.subscriptionapi.dto.PlanUpdateRequest;
import com.subscriptionapi.entity.Plan;
import com.subscriptionapi.entity.PlanStatus;
import com.subscriptionapi.entity.ServiceType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.repository.PlanRepository;
import com.subscriptionapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PlanService {
    
    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    
    // Create plan (OPERATOR only)
    @Transactional
    public PlanResponseDTO createPlan(Long userId, PlanCreateRequest planCreateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Plan plan = Plan.builder()
                .user(user)
                .name(planCreateRequest.getName())
                .description(planCreateRequest.getDescription())
                .serviceType(planCreateRequest.getServiceType())
                .basePrice(planCreateRequest.getBasePrice())
                .billingPeriod(planCreateRequest.getBillingPeriod())
                .features(planCreateRequest.getFeatures())
                .status(PlanStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Plan savedPlan = planRepository.save(plan);
        return mapToDTO(savedPlan);
    }
    
    // Get plan by ID
    public PlanResponseDTO getPlanById(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        return mapToDTO(plan);
    }
    
    // Get all active plans with pagination
    public Page<PlanResponseDTO> getAllActivePlans(Pageable pageable) {
        return planRepository.findByStatus("ACTIVE", pageable)
                .map(this::mapToDTO);
    }
    
    // Get plans by service type with pagination
    public Page<PlanResponseDTO> getPlansByServiceType(ServiceType serviceType, Pageable pageable) {
        return planRepository.findByServiceType(serviceType, pageable)
                .map(this::mapToDTO);
    }
    
    // Search plans by name or description
    public Page<PlanResponseDTO> searchPlans(String query, Pageable pageable) {
        return planRepository.searchPlans(query, pageable)
                .map(this::mapToDTO);
    }
    
    // Get current operator's plans
    public Page<PlanResponseDTO> getOperatorPlans(Long userId, Pageable pageable) {
        return planRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
    }
    
    // Update plan (owner only)
    @Transactional
    public PlanResponseDTO updatePlan(Long planId, Long userId, PlanUpdateRequest planUpdateRequest) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        
        // Verify ownership
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own plans");
        }
        
        if (planUpdateRequest.getName() != null) {
            plan.setName(planUpdateRequest.getName());
        }
        if (planUpdateRequest.getDescription() != null) {
            plan.setDescription(planUpdateRequest.getDescription());
        }
        if (planUpdateRequest.getServiceType() != null) {
            plan.setServiceType(planUpdateRequest.getServiceType());
        }
        if (planUpdateRequest.getBasePrice() != null) {
            plan.setBasePrice(planUpdateRequest.getBasePrice());
        }
        if (planUpdateRequest.getBillingPeriod() != null) {
            plan.setBillingPeriod(planUpdateRequest.getBillingPeriod());
        }
        if (planUpdateRequest.getFeatures() != null) {
            plan.setFeatures(planUpdateRequest.getFeatures());
        }
        
        plan.setUpdatedAt(LocalDateTime.now());
        Plan updatedPlan = planRepository.save(plan);
        return mapToDTO(updatedPlan);
    }
    
    // Soft delete plan (owner only)
    @Transactional
    public void deletePlan(Long planId, Long userId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        
        // Verify ownership
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own plans");
        }
        
        plan.setStatus(PlanStatus.INACTIVE);
        plan.setUpdatedAt(LocalDateTime.now());
        planRepository.save(plan);
    }
    
    // Map Plan entity to DTO
    private PlanResponseDTO mapToDTO(Plan plan) {
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
}
