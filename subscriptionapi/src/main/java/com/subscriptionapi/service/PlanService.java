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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {
    
    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public PlanResponseDTO createPlan(Long userId, PlanCreateRequest planCreateRequest) {
        System.out.println("=== CREATE PLAN START ===");
        System.out.println("User ID: " + userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String features = planCreateRequest.getFeatures();
        System.out.println("1. Raw features from request: '" + features + "'");
        
        if (features != null) {
            features = features.trim();
            System.out.println("2. After trim: '" + features + "'");
            
            if (features.startsWith("\"") && features.endsWith("\"")) {
                features = features.substring(1, features.length() - 1);
                System.out.println("3. After quote removal: '" + features + "'");
            }
        }
        
        System.out.println("4. Features before Plan.builder: '" + features + "'");
        
        Plan plan = Plan.builder()
                .user(user)
                .name(planCreateRequest.getName())
                .description(planCreateRequest.getDescription())
                .serviceType(planCreateRequest.getServiceType())
                .basePrice(planCreateRequest.getBasePrice())
                .billingPeriod(planCreateRequest.getBillingPeriod())
                .features(features)
                .status(PlanStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        System.out.println("5. Plan.features after builder: '" + plan.getFeatures() + "'");
        
        Plan savedPlan = planRepository.save(plan);
        
        System.out.println("6. Plan.features after repository.save: '" + savedPlan.getFeatures() + "'");
        System.out.println("7. Saved plan ID: " + savedPlan.getId());
        
        // Force refresh from database
        Plan refreshedPlan = planRepository.findById(savedPlan.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        
        System.out.println("8. Plan.features after SELECT from database: '" + refreshedPlan.getFeatures() + "'");
        System.out.println("=== CREATE PLAN END ===");
        
        return mapToDTO(refreshedPlan);
    }
    
    // Get plan by ID
    public PlanResponseDTO getPlanById(Long planId) {
        System.out.println("=== GET PLAN BY ID START ===");
        System.out.println("Plan ID: " + planId);
        
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        
        System.out.println("Retrieved plan features: '" + plan.getFeatures() + "'");
        System.out.println("=== GET PLAN BY ID END ===");
        
        return mapToDTO(plan);
    }

    
    // Get all active plans with pagination
    public Page<PlanResponseDTO> getAllActivePlans(Pageable pageable) {
        log.debug("Fetching all active plans");
        return planRepository.findByStatus(PlanStatus.ACTIVE, pageable)
                .map(this::mapToDTO);
    }
    
    // Get plans by service type with pagination
    public Page<PlanResponseDTO> getPlansByServiceType(ServiceType serviceType, Pageable pageable) {
        log.debug("Fetching plans by service type: {}", serviceType);
        return planRepository.findByServiceType(serviceType, pageable)
                .map(this::mapToDTO);
    }
    
    public Page<PlanResponseDTO> searchPlans(String query, Pageable pageable) {
        log.debug("Searching plans with query: {}", query);
        return planRepository.searchPlans(query, PlanStatus.ACTIVE, pageable)
                .map(this::mapToDTO);
    }

    
    // Get current operator's plans
    public Page<PlanResponseDTO> getOperatorPlans(Long userId, Pageable pageable) {
        log.debug("Fetching operator plans for user ID: {}", userId);
        return planRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
    }
    
    // Update plan (owner only)
    @Transactional
    public PlanResponseDTO updatePlan(Long planId, Long userId, PlanUpdateRequest planUpdateRequest) {
        log.info("=== UPDATE PLAN START ===");
        log.info("Plan ID: {}, User ID: {}", planId, userId);
        log.info("Update request: {}", planUpdateRequest);
        
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
            log.debug("Updating features");
            String features = planUpdateRequest.getFeatures();
            log.debug("Raw features from update request: '{}'", features);
            log.debug("Features length: {}", features.length());
            
            features = features.trim();
            log.debug("Features after trim: '{}'", features);
            
            if (features.startsWith("\"") && features.endsWith("\"")) {
                log.debug("Removing surrounding quotes from features");
                features = features.substring(1, features.length() - 1);
                log.debug("Features after quote removal: '{}'", features);
            }
            
            log.info("Final features to update: '{}'", features);
            plan.setFeatures(features);
        }
        
        plan.setUpdatedAt(LocalDateTime.now());
        Plan updatedPlan = planRepository.save(plan);
        log.info("Plan updated. Saved features: '{}'", updatedPlan.getFeatures());
        log.info("=== UPDATE PLAN END ===");
        
        return mapToDTO(updatedPlan);
    }

    // Soft delete plan (owner only)
    @Transactional
    public void deletePlan(Long planId, Long userId) {
        log.info("Deleting plan ID: {} for user ID: {}", planId, userId);
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        
        // Verify ownership
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own plans");
        }
        
        plan.setStatus(PlanStatus.INACTIVE);
        plan.setUpdatedAt(LocalDateTime.now());
        planRepository.save(plan);
        log.info("Plan deleted successfully");
    }
    
    // Map Plan entity to DTO
    private PlanResponseDTO mapToDTO(Plan plan) {
        log.debug("Mapping plan to DTO. Features: '{}'", plan.getFeatures());
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

    public Page<PlanPublicResponseDTO> getAllActivePlansForPublic(Pageable pageable) {
        log.debug("Fetching all active plans for public view");
        return planRepository.findByStatus(PlanStatus.ACTIVE, pageable)
                .map(this::mapToPublicDTO);
    }

    private PlanPublicResponseDTO mapToPublicDTO(Plan plan) {
        String operatorName = plan.getUser().getFirstName() + " " + plan.getUser().getLastName();
        return PlanPublicResponseDTO.builder()
                .id(plan.getId())
                .operatorName(operatorName)
                .name(plan.getName())
                .description(plan.getDescription())
                .serviceType(plan.getServiceType())
                .basePrice(plan.getBasePrice())
                .billingPeriod(plan.getBillingPeriod())
                .features(plan.getFeatures())
                .build();
    }

    @Transactional
    public PlanResponseDTO activatePlan(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setUpdatedAt(LocalDateTime.now());
        return mapToDTO(planRepository.save(plan));
    }

    @Transactional
    public PlanResponseDTO deactivatePlan(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        plan.setStatus(PlanStatus.INACTIVE);
        plan.setUpdatedAt(LocalDateTime.now());
        return mapToDTO(planRepository.save(plan));
    }
}
