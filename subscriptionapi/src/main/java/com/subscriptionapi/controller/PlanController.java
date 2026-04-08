package com.subscriptionapi.controller;

import com.subscriptionapi.dto.PlanCreateRequest;
import com.subscriptionapi.dto.PlanResponseDTO;
import com.subscriptionapi.dto.PlanUpdateRequest;
import com.subscriptionapi.dto.PlanPublicResponseDTO;
import com.subscriptionapi.entity.ServiceType;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.service.PlanService;
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
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {
    
    private final PlanService planService;
    private final UserRepository userRepository;

    @GetMapping("/service-types")
    public ResponseEntity<List<String>> getServiceTypes() {
        List<String> serviceTypes = Arrays.stream(ServiceType.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(serviceTypes);
    }
    
    /**
     * Get all active plans with pagination
     */
    @GetMapping
    public ResponseEntity<Page<PlanPublicResponseDTO>> getAllPlans(Pageable pageable) {
        Page<PlanPublicResponseDTO> plans = planService.getAllActivePlansForPublic(pageable);
        return ResponseEntity.ok(plans);
    }
    
    /**
     * Get plan by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlanResponseDTO> getPlanById(@PathVariable Long id) {
        PlanResponseDTO plan = planService.getPlanById(id);
        return ResponseEntity.ok(plan);
    }
    
    /**
     * Get current operator's plans
     */
    @GetMapping("/my-plans")
    @PreAuthorize("hasRole('OPERATOR') && isAuthenticated()")
    public ResponseEntity<Page<PlanResponseDTO>> getMyPlans(Pageable pageable) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"))
            .getId();
        
        Page<PlanResponseDTO> plans = planService.getOperatorPlans(userId, pageable);
        return ResponseEntity.ok(plans);
    }
    
    /**
     * Filter plans by service type
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<PlanResponseDTO>> filterByServiceType(
            @RequestParam ServiceType serviceType,
            Pageable pageable) {
        Page<PlanResponseDTO> plans = planService.getPlansByServiceType(serviceType, pageable);
        return ResponseEntity.ok(plans);
    }
    
    /**
     * Search plans by name or description
     */
    @GetMapping("/search")
    public ResponseEntity<Page<PlanResponseDTO>> searchPlans(
            @RequestParam String q,
            Pageable pageable) {
        Page<PlanResponseDTO> plans = planService.searchPlans(q, pageable);
        return ResponseEntity.ok(plans);
    }
    
    /**
     * Create new plan (OPERATOR only)
     */
    @PostMapping
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<PlanResponseDTO> createPlan(
            @Valid @RequestBody PlanCreateRequest planCreateRequest) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"))
            .getId();
        
        PlanResponseDTO createdPlan = planService.createPlan(userId, planCreateRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
    }
    
    /**
     * Update plan (owner only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<PlanResponseDTO> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody PlanUpdateRequest planUpdateRequest) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"))
            .getId();
        
        PlanResponseDTO updatedPlan = planService.updatePlan(id, userId, planUpdateRequest);
        return ResponseEntity.ok(updatedPlan);
    }
    
    /**
     * Delete plan (owner only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Long userId = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"))
            .getId();
        
        planService.deletePlan(id, userId);
        return ResponseEntity.noContent().build();
    }


    /**
     * Admin: Activate plan
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanResponseDTO> activatePlan(@PathVariable Long id) {
        PlanResponseDTO plan = planService.activatePlan(id);
        return ResponseEntity.ok(plan);
    }

    /**
     * Admin: Deactivate plan
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanResponseDTO> deactivatePlan(@PathVariable Long id) {
        PlanResponseDTO plan = planService.deactivatePlan(id);
        return ResponseEntity.ok(plan);
    }
}
