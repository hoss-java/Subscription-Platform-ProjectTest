package com.subscriptionapi.service;

import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.dto.PlanResponseDTO;
import com.subscriptionapi.dto.PlanCreateRequest;
import com.subscriptionapi.dto.PlanUpdateRequest;

import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.Plan;
import com.subscriptionapi.entity.ServiceType;
import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.entity.PlanStatus;

import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.PlanRepository;

import com.subscriptionapi.util.PasswordValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.HashSet;
import java.util.Optional;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================================
 * PLAN SERVICE OWNERSHIP INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * This test class validates the plan ownership and authorization workflow, including:
 * - Operator can create plans (assigned to their userId)
 * - Operator can update only their own plans
 * - Operator cannot update other operators' plans
 * - Operator can delete only their own plans
 * - Operator cannot delete other operators' plans
 * - Proper error handling for ownership violations
 * 
 * Test Organization:
 * 1. Setup Phase: Initialize test data and dependencies
 * 2. Happy Path Tests: Verify successful ownership scenarios
 * 3. Failure Path Tests: Verify proper error handling for ownership violations
 * 4. Helper Methods: Centralized test data creation
 * 
 * ============================================================================
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Plan Service Ownership Integration Tests")
public class PlanServiceOwnershipIntegrationTest {
    
    @Autowired
    private PlanService planService;
    
    @Autowired
    private PlanRepository planRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    private User operator1;
    private User operator2;
    private Role operatorRole;
    
    private Plan planOperator1;
    private Plan planOperator2;
    
    @BeforeEach
    public void setUp() {
        userRepository.deleteAll();
        planRepository.deleteAll();
        
        operatorRole = roleRepository.findByName(RoleType.OPERATOR)
                .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));
        
        // Create two operators for ownership testing
        operator1 = User.builder()
                .email("operator1@example.com")
                .password("encodedPassword123")
                .firstName("Operator")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();
        
        operator2 = User.builder()
                .email("operator2@example.com")
                .password("encodedPassword456")
                .firstName("Operator")
                .lastName("Two")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();
        
        userRepository.save(operator1);
        userRepository.save(operator2);
        
        // Create test plans owned by each operator
        planOperator1 = Plan.builder()
                .user(operator1)
                .name("Operator1 Internet Plan")
                .description("Internet plan by operator1")
                .serviceType(ServiceType.INTERNET)
                .basePrice(new BigDecimal("29.99"))
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("[\"feature1\", \"feature2\"]")
                .status(PlanStatus.ACTIVE)
                .build();
        
        planOperator2 = Plan.builder()
                .user(operator2)
                .name("Operator2 Mobile Plan")
                .description("Mobile plan by operator2")
                .serviceType(ServiceType.MOBILE)
                .basePrice(new BigDecimal("49.99"))
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("[\"feature3\", \"feature4\"]")
                .status(PlanStatus.ACTIVE)
                .build();
        
        planRepository.save(planOperator1);
        planRepository.save(planOperator2);
    }

    // ============================================================================
    // SECTION 1: HAPPY PATH TESTS - SUCCESSFUL OWNERSHIP SCENARIOS
    // ============================================================================
    // 
    // Purpose: Verify that operators can successfully manage their own plans.
    //          These tests ensure core ownership functionality:
    //          - Operator can create a plan assigned to their userId
    //          - Operator can update their own plans
    //          - Operator can delete their own plans
    //          - Plan is correctly persisted with owner relationship
    //
    // ============================================================================
    
    @Test
    @DisplayName("Should create plan successfully and assign to operator")
    public void testCreatePlanAssignedToOperator() {
        // Scenario: Operator1 creates a new plan
        // Expected: Plan is created and assigned to operator1's userId
        
        PlanCreateRequest planCreateRequest = createValidPlanCreateRequest(
                "New Internet Plan",
                "Fast internet service",
                ServiceType.INTERNET,
                new BigDecimal("39.99"),
                BillingPeriod.MONTHLY
        );
        
        PlanResponseDTO createdPlan = planService.createPlan(operator1.getId(), planCreateRequest);
        
        // Verify response contains plan details
        assertNotNull(createdPlan);
        assertEquals("New Internet Plan", createdPlan.getName());
        assertEquals("Fast internet service", createdPlan.getDescription());
        assertEquals(ServiceType.INTERNET, createdPlan.getServiceType());
        assertEquals(new BigDecimal("39.99"), createdPlan.getBasePrice());
        assertEquals(operator1.getId(), createdPlan.getUserId());
        assertEquals(PlanStatus.ACTIVE, createdPlan.getStatus());
        
        // Verify plan is persisted in database with correct owner
        Optional<Plan> savedPlan = planRepository.findById(createdPlan.getId());
        assertTrue(savedPlan.isPresent());
        assertEquals(operator1.getId(), savedPlan.get().getUser().getId());
    }
    
    @Test
    @DisplayName("Should update plan successfully when operator is owner")
    public void testUpdatePlanSuccessWhenOperatorIsOwner() {
        // Scenario: Operator1 updates their own plan (planOperator1)
        // Expected: Plan is updated successfully with new values
        
        PlanUpdateRequest planUpdateRequest = PlanUpdateRequest.builder()
                .name("Updated Internet Plan")
                .description("Updated description")
                .basePrice(new BigDecimal("34.99"))
                .build();
        
        PlanResponseDTO updatedPlan = planService.updatePlan(
                planOperator1.getId(),
                operator1.getId(),
                planUpdateRequest
        );
        
        // Verify response contains updated values
        assertNotNull(updatedPlan);
        assertEquals("Updated Internet Plan", updatedPlan.getName());
        assertEquals("Updated description", updatedPlan.getDescription());
        assertEquals(new BigDecimal("34.99"), updatedPlan.getBasePrice());
        assertEquals(operator1.getId(), updatedPlan.getUserId());
        
        // Verify changes are persisted in database
        Optional<Plan> savedPlan = planRepository.findById(planOperator1.getId());
        assertTrue(savedPlan.isPresent());
        assertEquals("Updated Internet Plan", savedPlan.get().getName());
        assertEquals("Updated description", savedPlan.get().getDescription());
    }
    
    @Test
    @DisplayName("Should delete plan successfully when operator is owner")
    public void testDeletePlanSuccessWhenOperatorIsOwner() {
        // Scenario: Operator1 deletes their own plan (planOperator1)
        // Expected: Plan status is changed to INACTIVE (soft delete)
        
        Long planId = planOperator1.getId();
        
        planService.deletePlan(planId, operator1.getId());
        
        // Verify plan is soft-deleted (status changed to INACTIVE)
        Optional<Plan> deletedPlan = planRepository.findById(planId);
        assertTrue(deletedPlan.isPresent());
        assertEquals(PlanStatus.INACTIVE, deletedPlan.get().getStatus());
    }

    // ============================================================================
    // SECTION 2: OWNERSHIP VIOLATION TESTS - AUTHORIZATION FAILURES
    // ============================================================================
    //
    // Purpose: Verify that operators cannot modify other operators' plans.
    //          These tests ensure proper access control:
    //          - Operator cannot update another operator's plan
    //          - Operator cannot delete another operator's plan
    //          - Proper exception is thrown with clear error message
    //
    // Test Strategy: Parameterized test with different plan/operator combinations
    // - Operator1 attempts to modify Operator2's plans
    // - Operator2 attempts to modify Operator1's plans
    //
    // ============================================================================
    
    @ParameterizedTest(name = "Operator {0} cannot update Operator {1}'s plan")
    @DisplayName("Should deny update when operator is not plan owner")
    @CsvSource({
        "1,2",  // Operator1 tries to update Operator2's plan
        "2,1"   // Operator2 tries to update Operator1's plan
    })
    public void testUpdatePlanDeniedWhenNotOwner(int operatorNumber, int planOwnerNumber) {
        // Scenario: Operator tries to update a plan they don't own
        // Expected: RuntimeException thrown with ownership error message
        
        User operatorAttempting = operatorNumber == 1 ? operator1 : operator2;
        Plan planToUpdate = planOwnerNumber == 1 ? planOperator1 : planOperator2;
        
        PlanUpdateRequest planUpdateRequest = PlanUpdateRequest.builder()
                .name("Unauthorized Update")
                .build();
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            planService.updatePlan(planToUpdate.getId(), operatorAttempting.getId(), planUpdateRequest)
        );
        
        // Verify error message indicates ownership violation
        assertTrue(exception.getMessage().contains("can only update your own plans"),
                "Error message should indicate ownership violation");
        
        // Verify plan was NOT updated in database
        Plan unchangedPlan = planRepository.findById(planToUpdate.getId()).orElseThrow();
        assertNotEquals("Unauthorized Update", unchangedPlan.getName(),
                "Plan name should not be changed");
    }
    
    @ParameterizedTest(name = "Operator {0} cannot delete Operator {1}'s plan")
    @DisplayName("Should deny delete when operator is not plan owner")
    @CsvSource({
        "1,2",  // Operator1 tries to delete Operator2's plan
        "2,1"   // Operator2 tries to delete Operator1's plan
    })
    public void testDeletePlanDeniedWhenNotOwner(int operatorNumber, int planOwnerNumber) {
        // Scenario: Operator tries to delete a plan they don't own
        // Expected: RuntimeException thrown with ownership error message
        
        User operatorAttempting = operatorNumber == 1 ? operator1 : operator2;
        Plan planToDelete = planOwnerNumber == 1 ? planOperator1 : planOperator2;
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            planService.deletePlan(planToDelete.getId(), operatorAttempting.getId())
        );
        
        // Verify error message indicates ownership violation
        assertTrue(exception.getMessage().contains("can only delete your own plans"),
                "Error message should indicate ownership violation");
        
        // Verify plan was NOT deleted (status still ACTIVE)
        Plan undeletedPlan = planRepository.findById(planToDelete.getId()).orElseThrow();
        assertEquals(PlanStatus.ACTIVE, undeletedPlan.getStatus(),
                "Plan status should remain ACTIVE");
    }

    // ============================================================================
    // SECTION 3: HELPER METHODS
    // ============================================================================
    
    /**
     * HELPER METHOD: Create valid PlanCreateRequest
     * 
     * PURPOSE:
     * Encapsulates plan creation request logic to avoid code duplication.
     * Provides default values for all required fields.
     * 
     * @param name Plan name
     * @param description Plan description
     * @param serviceType Type of service
     * @param basePrice Base price
     * @param billingPeriod Billing period
     * @return Valid PlanCreateRequest ready for service method
     */
    private PlanCreateRequest createValidPlanCreateRequest(
            String name,
            String description,
            ServiceType serviceType,
            BigDecimal basePrice,
            BillingPeriod billingPeriod) {
        
        return PlanCreateRequest.builder()
                .name(name)
                .description(description)
                .serviceType(serviceType)
                .basePrice(basePrice)
                .billingPeriod(billingPeriod)
                .features("[\"feature1\", \"feature2\"]")
                .build();
    }
}
