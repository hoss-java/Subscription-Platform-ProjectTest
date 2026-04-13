package com.subscriptionapi.controller;

import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.dto.*;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================================
 * BILLING CONTROLLER APPROVAL WORKFLOW INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests approval workflow for billing payments.
 * Verifies operators can approve pending billings.
 * 
 * ENDPOINTS TESTED:
 * - PUT /api/billings/{id}/approve (OPERATOR only)
 * 
 * AUTHORIZATION:
 * - Only OPERATOR role can approve
 * - CUSTOMER, ADMIN roles denied (403)
 * - Unauthenticated requests denied (401)
 * 
 * APPROVAL LOGIC:
 * - Only PENDING billings can be approved
 * - Operator must own the billing (via subscription plan)
 * - Status changes: PENDING → PAID
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
@Transactional
@DisplayName("Billing Controller Approval Workflow Integration Tests")
@Slf4j
public class BillingControllerApprovalIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BillingRepository billingRepository;

    private User customer1;
    private User operator1;
    private User operator2;
    private User admin;

    private String customer1Token;
    private String operator1Token;
    private String operator2Token;
    private String adminToken;

    private Plan plan1;
    private Plan plan2;

    private Subscription subscription1;
    private Subscription subscription2;

    private Billing billingPending1;
    private Billing billingPending2;
    private Billing billingPaid;
    private Billing billingFailed;

    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;

    private static final String CUSTOMER1_EMAIL = "customer1@example.com";
    private static final String OPERATOR1_EMAIL = "operator1@example.com";
    private static final String OPERATOR2_EMAIL = "operator2@example.com";
    private static final String ADMIN_EMAIL = "admin@example.com";

    @BeforeEach
    void setUp() {
        billingRepository.deleteAll();
        subscriptionRepository.deleteAll();
        planRepository.deleteAll();
        userRepository.deleteAll();

        // Load roles
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
        operatorRole = roleRepository.findByName(RoleType.OPERATOR)
            .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));
        adminRole = roleRepository.findByName(RoleType.ADMIN)
            .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        // Create users
        customer1 = User.builder()
                .email(CUSTOMER1_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        operator1 = User.builder()
                .email(OPERATOR1_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();

        operator2 = User.builder()
                .email(OPERATOR2_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("Two")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();

        admin = User.builder()
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Admin")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(adminRole)))
                .build();

        userRepository.save(customer1);
        userRepository.save(operator1);
        userRepository.save(operator2);
        userRepository.save(admin);

        // Create plans
        plan1 = Plan.builder()
                .user(operator1)
                .name("Plan 1 by Operator 1")
                .description("Test plan 1")
                .serviceType(ServiceType.INTERNET)
                .basePrice(BigDecimal.valueOf(99.99))
                .billingPeriod(BillingPeriod.MONTHLY)
                .status(PlanStatus.ACTIVE)
                .build();

        plan2 = Plan.builder()
                .user(operator2)
                .name("Plan 2 by Operator 2")
                .description("Test plan 2")
                .serviceType(ServiceType.MOBILE)
                .basePrice(BigDecimal.valueOf(199.99))
                .billingPeriod(BillingPeriod.MONTHLY)
                .status(PlanStatus.ACTIVE)
                .build();

        planRepository.save(plan1);
        planRepository.save(plan2);

        // Create subscriptions
        subscription1 = Subscription.builder()
                .user(customer1)
                .plan(plan1)
                .operator(operator1)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .build();

        subscription2 = Subscription.builder()
                .user(customer1)
                .plan(plan2)
                .operator(operator2)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(false)
                .build();

        subscriptionRepository.save(subscription1);
        subscriptionRepository.save(subscription2);

        // Create billings with different statuses
        billingPending1 = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now().minusDays(10))
                .dueDate(LocalDateTime.now().minusDays(5))
                .status(BillingStatus.PAYMENT_CLAIMED)
                .build();

        billingPending2 = Billing.builder()
                .subscription(subscription2)
                .amount(BigDecimal.valueOf(199.99))
                .billingDate(LocalDateTime.now().minusDays(5))
                .dueDate(LocalDateTime.now())
                .status(BillingStatus.PAYMENT_CLAIMED)
                .build();

        billingPaid = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now().minusDays(40))
                .dueDate(LocalDateTime.now().minusDays(35))
                .paidDate(LocalDateTime.now().minusDays(30))
                .status(BillingStatus.PAID)
                .build();

        billingFailed = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now().minusDays(70))
                .dueDate(LocalDateTime.now().minusDays(60))
                .status(BillingStatus.FAILED)
                .build();

        billingRepository.save(billingPending1);
        billingRepository.save(billingPending2);
        billingRepository.save(billingPaid);
        billingRepository.save(billingFailed);


        billingRepository.save(billingFailed);

        // Generate tokens
        customer1Token = jwtTokenProvider.generateToken(customer1);
        operator1Token = jwtTokenProvider.generateToken(operator1);
        operator2Token = jwtTokenProvider.generateToken(operator2);
        adminToken = jwtTokenProvider.generateToken(admin);
    }

    // ============================================================================
    // PARAMETERIZED TESTS FOR /approve ENDPOINT
    // ============================================================================

    /**
     * PARAMETERIZED TEST: Only PAYMENT_CLAIMED billings can be approved
     * 
     * SCENARIO:
     * Attempt to approve billings with different statuses
     * 
     * EXPECTED:
     * - PAYMENT_CLAIMED: HTTP 200 OK, status changes to PAID
     * - PAID, FAILED: HTTP 400 or 409 (cannot approve non-claimed)
     */
    void testApproveBillingByStatus(Billing billing, BillingStatus status, boolean shouldSucceed) throws Exception {
        Billing testBilling = billingRepository.findAll().stream()
            .filter(b -> b.getStatus() == status)
            .findFirst()
            .orElseThrow();
        
        if (shouldSucceed) {
            mockMvc.perform(put("/api/billings/" + testBilling.getId() + "/approve")
                    .header("Authorization", "Bearer " + operator1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PAID")))
                .andDo(result -> {
                    log.info("Billing {} approved successfully", billing.getId());
                });
        } else {
            mockMvc.perform(put("/api/billings/" + billing.getId() + "/approve")
                    .header("Authorization", "Bearer " + operator1Token))
                .andExpect(status().is4xxClientError())
                .andDo(result -> {
                    log.info("Billing {} with status {} cannot be approved", billing.getId(), status);
                });
        }
    }

    private static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> provideBillingStatusesForApproval() {
        return java.util.stream.Stream.of(
            arguments(null, BillingStatus.PAYMENT_CLAIMED, true),
            arguments(null, BillingStatus.PAID, false),
            arguments(null, BillingStatus.FAILED, false)
        );
    }


    /**
     * TEST: Operator can approve PAYMENT_CLAIMED billing
     * 
     * SCENARIO:
     * Operator1 approves PAYMENT_CLAIMED billing from their plan
     * 
     * EXPECTED:
     * - HTTP 200 OK
     * - Billing status changes to PAID
     * - paidDate is set
     */
    @Test
    @DisplayName("PUT /{id}/approve operator approves own PAYMENT_CLAIMED billing")
    void testApproveOwnPendingBilling() throws Exception {
        mockMvc.perform(put("/api/billings/" + billingPending1.getId() + "/approve")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(billingPending1.getId().intValue())))
            .andExpect(jsonPath("$.status", is("PAID")))
            .andExpect(jsonPath("$.paidDate", notNullValue()))
            .andDo(result -> {
                log.info("Operator1 approved billing {}", billingPending1.getId());
            });
    }

    /**
     * TEST: Operator cannot approve billing from another operator's plan
     * 
     * SCENARIO:
     * Operator1 tries to approve pending billing from Operator2's plan
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden (ownership check)
     */
    @Test
    @DisplayName("PUT /{id}/approve denies approval of other operator's billing")
    void testApproveOtherOperatorBillingDenied() throws Exception {
        mockMvc.perform(put("/api/billings/" + billingPending2.getId() + "/approve")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Operator1 denied approval of Operator2's billing");
            });
    }

    /**
     * TEST: Cannot approve non-existent billing
     * 
     * SCENARIO:
     * Try to approve billing with invalid ID
     * 
     * EXPECTED:
     * - HTTP 404 Not Found
     */
    @Test
    @DisplayName("PUT /{id}/approve returns 404 for non-existent billing")
    void testApproveNonExistentBillingNotFound() throws Exception {
        mockMvc.perform(put("/api/billings/99999/approve")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isNotFound())
            .andDo(result -> {
                log.info("Approval of non-existent billing returns 404");
            });
    }

    // ============================================================================
    // AUTHORIZATION TESTS FOR /approve ENDPOINT
    // ============================================================================

    /**
     * TEST: CUSTOMER role denied access (403 Forbidden)
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     */
    @Test
    @DisplayName("PUT /{id}/approve denies CUSTOMER role (403)")
    void testApproveCustomerAccessDenied() throws Exception {
        mockMvc.perform(put("/api/billings/" + billingPending1.getId() + "/approve")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Customer access denied to /approve");
            });
    }

    /**
     * TEST: ADMIN role denied access (403 Forbidden)
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     */
    @Test
    @DisplayName("PUT /{id}/approve denies ADMIN role (403)")
    void testApproveAdminAccessDenied() throws Exception {
        mockMvc.perform(put("/api/billings/" + billingPending1.getId() + "/approve")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Admin access denied to /approve");
            });
    }

    /**
     * TEST: Unauthenticated request denied (401 Unauthorized)
     * 
     * EXPECTED:
     * - HTTP 401 Unauthorized
     */
    @Test
    @DisplayName("PUT /{id}/approve denies unauthenticated request (401)")
    void testApproveUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(put("/api/billings/" + billingPending1.getId() + "/approve"))
            .andExpect(status().isUnauthorized())
            .andDo(result -> {
                log.info("Unauthenticated access denied to /approve");
            });
    }
}
