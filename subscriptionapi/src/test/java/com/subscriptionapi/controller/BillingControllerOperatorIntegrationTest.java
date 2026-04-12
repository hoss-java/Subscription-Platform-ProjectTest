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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================================
 * BILLING CONTROLLER OPERATOR ENDPOINTS INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests operator-specific billing endpoints with status filters.
 * Verifies that operators only see billings from their issued plans.
 * 
 * ENDPOINTS TESTED:
 * - GET /api/billings/operator/issued (OPERATOR only)
 * - GET /api/billings/operator/issued?status=Y (with status filter)
 * 
 * AUTHORIZATION:
 * - Only OPERATOR role can access
 * - CUSTOMER, ADMIN roles denied (403)
 * - Unauthenticated requests denied (401)
 * 
 * DATA MODEL:
 * Operator1 created 2 plans → 2 subscriptions → 4 billings
 * Operator2 created 1 plan → 1 subscription → 1 billing
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
@Transactional
@DisplayName("Billing Controller Operator Endpoints Integration Tests")
@Slf4j
public class BillingControllerOperatorIntegrationTest {

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
    private User customer2;
    private User operator1;
    private User operator2;
    private User admin;

    private String customer1Token;
    private String operator1Token;
    private String operator2Token;
    private String adminToken;

    private Plan plan1;
    private Plan plan2;
    private Plan plan3;

    private Subscription subscription1;
    private Subscription subscription2;
    private Subscription subscription3;

    private Billing billing1;
    private Billing billing2;
    private Billing billing3;
    private Billing billing4;
    private Billing billing5;

    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;

    private static final String CUSTOMER1_EMAIL = "customer1@example.com";
    private static final String CUSTOMER2_EMAIL = "customer2@example.com";
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

        // Create customers
        customer1 = User.builder()
                .email(CUSTOMER1_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        customer2 = User.builder()
                .email(CUSTOMER2_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("Two")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        userRepository.save(customer1);
        userRepository.save(customer2);

        // Create operators
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

        userRepository.save(operator1);
        userRepository.save(operator2);

        // Create admin
        admin = User.builder()
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Admin")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(adminRole)))
                .build();

        userRepository.save(admin);

        // Create plans issued by operator1
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
                .user(operator1)
                .name("Plan 2 by Operator 1")
                .description("Test plan 2")
                .serviceType(ServiceType.BUNDLE)
                .basePrice(BigDecimal.valueOf(199.99))
                .billingPeriod(BillingPeriod.YEARLY)
                .status(PlanStatus.ACTIVE)
                .build();

        // Create plan issued by operator2
        plan3 = Plan.builder()
                .user(operator2)
                .name("Plan 3 by Operator 2")
                .description("Test plan 3")
                .serviceType(ServiceType.MOBILE)
                .basePrice(BigDecimal.valueOf(299.99))
                .billingPeriod(BillingPeriod.MONTHLY)
                .status(PlanStatus.ACTIVE)
                .build();

        planRepository.save(plan1);
        planRepository.save(plan2);
        planRepository.save(plan3);

        // Create subscriptions for operator1's plans
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
                .operator(operator1)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(false)
                .build();

        // Create subscription for operator2's plan
        subscription3 = Subscription.builder()
                .user(customer2)
                .plan(plan3)
                .operator(operator2)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .build();

        subscriptionRepository.save(subscription1);
        subscriptionRepository.save(subscription2);
        subscriptionRepository.save(subscription3);

        // Create billings for operator1's subscriptions
        billing1 = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now().minusDays(10))
                .dueDate(LocalDateTime.now().minusDays(5))
                .status(BillingStatus.PENDING)
                .build();

        billing2 = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now().minusDays(40))
                .dueDate(LocalDateTime.now().minusDays(35))
                .paidDate(LocalDateTime.now().minusDays(30))
                .status(BillingStatus.PAID)
                .build();

        billing3 = Billing.builder()
                .subscription(subscription2)
                .amount(BigDecimal.valueOf(199.99))
                .billingDate(LocalDateTime.now().minusDays(5))
                .dueDate(LocalDateTime.now())
                .status(BillingStatus.PENDING)
                .build();

        billing4 = Billing.builder()
                .subscription(subscription2)
                .amount(BigDecimal.valueOf(199.99))
                .billingDate(LocalDateTime.now().minusDays(70))
                .dueDate(LocalDateTime.now().minusDays(60))
                .status(BillingStatus.FAILED)
                .build();

        // Create billing for operator2's subscription
        billing5 = Billing.builder()
                .subscription(subscription3)
                .amount(BigDecimal.valueOf(299.99))
                .billingDate(LocalDateTime.now().minusDays(20))
                .dueDate(LocalDateTime.now().minusDays(15))
                .status(BillingStatus.FAILED)
                .build();

        billingRepository.save(billing1);
        billingRepository.save(billing2);
        billingRepository.save(billing3);
        billingRepository.save(billing4);
        billingRepository.save(billing5);

        // Generate tokens
        customer1Token = jwtTokenProvider.generateToken(customer1);
        operator1Token = jwtTokenProvider.generateToken(operator1);
        operator2Token = jwtTokenProvider.generateToken(operator2);
        adminToken = jwtTokenProvider.generateToken(admin);
    }

    // ============================================================================
    // PARAMETERIZED TESTS FOR /operator/issued ENDPOINT
    // ============================================================================

    /**
     * PARAMETERIZED TEST: GET /operator/issued with various status filters
     * 
     * SCENARIO:
     * Operator1 issued 4 billings total:
     * - billing1: PENDING (subscription1)
     * - billing2: PAID (subscription1)
     * - billing3: PENDING (subscription2)
     * - billing4: FAILED (subscription2)
     * 
     * Tests filter with PENDING, PAID, FAILED, CANCELLED statuses
     */
    @ParameterizedTest(name = "Operator1 issued status filter: {0} expects {1} results")
    @MethodSource("provideOperatorIssuedStatusFilterParams")
    @DisplayName("GET /operator/issued filters by status (parameterized)")
    void testGetOperatorIssuedFilterByStatus(String status, int expectedCount) throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token)
                .param("status", status))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(expectedCount)))
            .andDo(result -> {
                log.info("Operator1 issued billings (status filter {}): count = {}", 
                    status, expectedCount);
            });
    }

    static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> provideOperatorIssuedStatusFilterParams() {
        return java.util.stream.Stream.of(
            arguments("PENDING", 2),
            arguments("PAID", 1),
            arguments("FAILED", 1),
            arguments("CANCELLED", 0),
            arguments("REFUNDED", 0)
        );
    }

    // ============================================================================
    // BASIC TESTS FOR /operator/issued ENDPOINT
    // ============================================================================

    /**
     * TEST: GET /operator/issued without filters returns all operator's billings
     * 
     * SCENARIO:
     * Operator1 should see all 4 billings (no status filter)
     * 
     * EXPECTED:
     * - HTTP 200 OK
     * - 4 billings returned
     */
    @Test
    @DisplayName("GET /operator/issued returns all issued billings (no filter)")
    void testGetOperatorIssuedNoFilter() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(4)))
            .andExpect(jsonPath("$[*].id", containsInAnyOrder(
                billing1.getId().intValue(),
                billing2.getId().intValue(),
                billing3.getId().intValue(),
                billing4.getId().intValue()
            )))
            .andDo(result -> {
                log.info("Operator1 all issued billings: {}", result.getResponse().getContentAsString());
            });
    }

    /**
     * TEST: Operator1 and Operator2 see only their own issued billings
     * 
     * SCENARIO:
     * Operator1 issued 4 billings
     * Operator2 issued 1 billing
     * 
     * EXPECTED:
     * - Operator1 sees 4 billings
     * - Operator2 sees 1 billing
     */
    @Test
    @DisplayName("GET /operator/issued isolation - operators see only their own billings")
    void testOperatorIsolation() throws Exception {
        // Operator1 sees 4 billings
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(4)))
            .andDo(result -> {
                log.info("Operator1 issued billings: count = 4");
            });

        // Operator2 sees 1 billing
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator2Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id", is(billing5.getId().intValue())))
            .andDo(result -> {
                log.info("Operator2 issued billings: count = 1");
            });
    }

    // ============================================================================
    // AUTHORIZATION TESTS FOR /operator/issued ENDPOINT
    // ============================================================================

    /**
     * TEST: CUSTOMER role denied access (403 Forbidden)
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     */
    @Test
    @DisplayName("GET /operator/issued denies CUSTOMER role (403)")
    void testOperatorIssuedCustomerAccessDenied() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Customer access denied to /operator/issued");
            });
    }

    /**
     * TEST: ADMIN role denied access (403 Forbidden)
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     */
    @Test
    @DisplayName("GET /operator/issued denies ADMIN role (403)")
    void testOperatorIssuedAdminAccessDenied() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Admin access denied to /operator/issued");
            });
    }

    /**
     * TEST: Unauthenticated request denied (401 Unauthorized)
     * 
     * EXPECTED:
     * - HTTP 401 Unauthorized
     */
    @Test
    @DisplayName("GET /operator/issued denies unauthenticated request (401)")
    void testOperatorIssuedUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued"))
            .andExpect(status().isUnauthorized())
            .andDo(result -> {
                log.info("Unauthenticated access denied to /operator/issued");
            });
    }

    /**
     * PARAMETERIZED TEST: Invalid status values filtered out
     * 
     * SCENARIO:
     * Send invalid/non-existent status values
     * 
     * EXPECTED:
     * - Returns empty list (no billings match invalid status)
     */
    @ParameterizedTest(name = "Invalid status filter: {0} expects empty result")
    @MethodSource("provideInvalidStatusFilters")
    @DisplayName("GET /operator/issued returns empty for invalid status filters")
    void testGetOperatorIssuedInvalidStatusFilter(String invalidStatus) throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token)
                .param("status", invalidStatus))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)))
            .andDo(result -> {
                log.info("Invalid status filter {} returns empty list", invalidStatus);
            });
    }

    static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> provideInvalidStatusFilters() {
        return java.util.stream.Stream.of(
            arguments("INVALID_STATUS"),
            arguments("UNKNOWN"),
            arguments("PROCESSING")
        );
    }
}
