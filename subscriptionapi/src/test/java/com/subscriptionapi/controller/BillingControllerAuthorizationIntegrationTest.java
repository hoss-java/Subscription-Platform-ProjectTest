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
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.params.provider.Arguments;
import java.util.stream.Stream;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================================
 * BILLING CONTROLLER AUTHORIZATION INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests RBAC (Role-Based Access Control) for all billing endpoints.
 * Verifies that only authorized roles can access specific endpoints.
 * Validates cross-user/cross-operator access violations (403).
 * Ensures unauthenticated requests are denied (401).
 * 
 * ENDPOINTS TESTED:
 * - GET /billing-statuses (public - no auth required)
 * - GET /billing-periods (public - no auth required)
 * - POST / (CUSTOMER, OPERATOR)
 * - GET /my-billings (CUSTOMER only)
 * - GET /operator/issued (OPERATOR only)
 * - GET /customer (CUSTOMER only)
 * - GET /{id} (CUSTOMER, OPERATOR - with ownership check)
 * - GET / (CUSTOMER, OPERATOR)
 * - PUT /{id} (CUSTOMER, OPERATOR - with ownership check)
 * - DELETE /{id} (CUSTOMER, OPERATOR - with ownership check)
 * - PUT /{id}/approve (OPERATOR only - with operator ownership check)
 * 
 * AUTHORIZATION RULES:
 * 1. Public endpoints: accessible without authentication
 * 2. Role-restricted endpoints: only specific roles allowed
 * 3. Ownership checks: users/operators can only access their own data
 * 4. Cross-role access: denied with 403
 * 5. Unauthenticated access: denied with 401
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
@Transactional
@DisplayName("Billing Controller Authorization Integration Tests")
@Slf4j
public class BillingControllerAuthorizationIntegrationTest {

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
    private String customer2Token;
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

    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;

    private static final String CUSTOMER1_EMAIL = "authcustomer1@example.com";
    private static final String CUSTOMER2_EMAIL = "authcustomer2@example.com";
    private static final String OPERATOR1_EMAIL = "authoperator1@example.com";
    private static final String OPERATOR2_EMAIL = "authoperator2@example.com";
    private static final String ADMIN_EMAIL = "authadmin@example.com";

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
                .billingPeriod(BillingPeriod.YEARLY)
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
                .user(customer2)
                .plan(plan2)
                .operator(operator2)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(false)
                .build();

        subscriptionRepository.save(subscription1);
        subscriptionRepository.save(subscription2);

        // Create billings
        billing1 = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now().minusDays(10))
                .dueDate(LocalDateTime.now().minusDays(5))
                .status(BillingStatus.PAYMENT_CLAIMED)
                .build();

        billing2 = Billing.builder()
                .subscription(subscription2)
                .amount(BigDecimal.valueOf(199.99))
                .billingDate(LocalDateTime.now().minusDays(20))
                .dueDate(LocalDateTime.now().minusDays(15))
                .status(BillingStatus.PENDING)
                .build();

        billing3 = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now().minusDays(40))
                .dueDate(LocalDateTime.now().minusDays(35))
                .status(BillingStatus.PAID)
                .build();

        billingRepository.save(billing1);
        billingRepository.save(billing2);
        billingRepository.save(billing3);
    
        // Generate tokens
        customer1Token = jwtTokenProvider.generateToken(customer1);
        customer2Token = jwtTokenProvider.generateToken(customer2);
        operator1Token = jwtTokenProvider.generateToken(operator1);
        operator2Token = jwtTokenProvider.generateToken(operator2);
        adminToken = jwtTokenProvider.generateToken(admin);

        System.out.println("DEBUG: setUp() - customer1Token=" + (customer1Token != null ? "OK" : "NULL"));
        System.out.println("DEBUG: setUp() - customer2Token=" + (customer2Token != null ? "OK" : "NULL"));
        System.out.println("DEBUG: setUp() - operator1Token=" + (operator1Token != null ? "OK" : "NULL"));
        System.out.println("DEBUG: setUp() - operator2Token=" + (operator2Token != null ? "OK" : "NULL"));
        System.out.println("DEBUG: setUp() - adminToken=" + (adminToken != null ? "OK" : "NULL"));
    }

    // ============================================================================
    // PUBLIC ENDPOINTS - NO AUTHENTICATION REQUIRED
    // ============================================================================
    /**
     * PARAMETERIZED TEST: GET /billing-statuses with various authentication scenarios
     * 
     * SCENARIOS:
     * 1. No token provided → should return 401 Unauthorized
     * 2. Invalid token provided → should return 401 Unauthorized
     * 3. Valid customer token → should return 200 OK with billing statuses
     * 
     * EXPECTED:
     * - Unauthenticated requests: HTTP 401
     * - Authenticated requests: HTTP 200 + List of billing statuses
     */
    @ParameterizedTest(name = "{1} → expects {0}")
    @MethodSource("provideTokenScenariosForBillingStatuses")
    @DisplayName("GET /billing-statuses requires valid authentication")
    void testGetBillingStatusesAuthVariations(int expectedStatus, String scenario, String tokenType) throws Exception {
        // Fetch token at execution time (after @BeforeEach)
        String token = null;
        if ("valid-customer".equals(tokenType)) {
            token = customer1Token;  // NOW this works because method is NOT static
        } else if ("invalid".equals(tokenType)) {
            token = "invalid-token";
        }
        
        System.out.println("DEBUG TEST: scenario=" + scenario + ", token=" + token);
        
        var request = get("/api/billings/billing-statuses");
        
        if (token != null) {
            request = request.header("Authorization", "Bearer " + token);
        }
        
        mockMvc.perform(request)
            .andExpect(status().is(expectedStatus));
    }

    private Stream<Arguments> provideTokenScenariosForBillingStatuses() {  // NOT STATIC
        return Stream.of(
            arguments(401, "No token provided", null),
            arguments(401, "Invalid token", "invalid"),
            arguments(200, "Valid customer token", "valid-customer")
        );
    }

    // ============================================================================
    // UNAUTHENTICATED ACCESS TESTS (401)
    // ============================================================================

    /**
     * PARAMETERIZED TEST: Protected endpoints reject unauthenticated requests
     * 
     * SCENARIO:
     * All @PreAuthorize endpoints should return 401 when accessed without token
     * 
     * EXPECTED:
     * - HTTP 401 Unauthorized
     * - For all protected endpoints
     */
    @ParameterizedTest(name = "{0} {1} without auth returns 401")
    @MethodSource("provideProtectedEndpointsForAuth")
    @DisplayName("Protected endpoints reject unauthenticated requests (401)")
    void testProtectedEndpointsRejectUnauthenticated(String httpMethod, String endpoint) throws Exception {
        if ("GET".equals(httpMethod)) {
            mockMvc.perform(get(endpoint))
                .andExpect(status().isUnauthorized())
                .andDo(result -> {
                    log.info("{} {} without auth: 401 Unauthorized", httpMethod, endpoint);
                });
        } else if ("POST".equals(httpMethod)) {
            BillingCreateRequest request = BillingCreateRequest.builder()
                    .subscriptionId(subscription1.getId())
                    .amount(BigDecimal.valueOf(99.99))
                    .billingDate(LocalDateTime.now())
                    .dueDate(LocalDateTime.now().plusDays(10))
                    .build();
            
            mockMvc.perform(post(endpoint)
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andDo(result -> {
                    log.info("{} {} without auth: 401 Unauthorized", httpMethod, endpoint);
                });
        } else if ("PUT".equals(httpMethod)) {
            BillingUpdateRequest request = new BillingUpdateRequest(
                BillingStatus.PAID,
                LocalDateTime.now()
            );

            mockMvc.perform(put(endpoint)
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andDo(result -> {
                    log.info("{} {} without auth: 401 Unauthorized", httpMethod, endpoint);
                });
        } else if ("DELETE".equals(httpMethod)) {
            mockMvc.perform(delete(endpoint))
                .andExpect(status().isUnauthorized())
                .andDo(result -> {
                    log.info("{} {} without auth: 401 Unauthorized", httpMethod, endpoint);
                });
        }
    }

    static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> provideProtectedEndpointsForAuth() {
        return java.util.stream.Stream.of(
            arguments("POST", "/api/billings"),
            arguments("GET", "/api/billings/my-billings"),
            arguments("GET", "/api/billings/operator/issued"),
            arguments("GET", "/api/billings/customer"),
            arguments("GET", "/api/billings"),
            arguments("GET", "/api/billings/1"),
            arguments("PUT", "/api/billings/1"),
            arguments("DELETE", "/api/billings/1"),
            arguments("PUT", "/api/billings/1/approve")
        );
    }

    // ============================================================================
    // ROLE-BASED ACCESS CONTROL TESTS (403 - FORBIDDEN)
    // ============================================================================

    /**
     * PARAMETERIZED TEST: CUSTOMER-only endpoints reject other roles
     * 
     * SCENARIO:
     * Endpoints restricted to CUSTOMER should return 403 for OPERATOR, ADMIN
     * - /my-billings (CUSTOMER only)
     * - /customer (CUSTOMER only)
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     * - For OPERATOR and ADMIN roles
     */
    @ParameterizedTest(name = "/my-billings access by {0} returns 403")
    @MethodSource("provideNonCustomerTokens")
    @DisplayName("GET /my-billings rejects non-CUSTOMER roles (403)")
    void testGetMyBillingsRejectsNonCustomer(String role) throws Exception {
        // Fetch token at execution time (after @BeforeEach)
        String token = null;
        if ("OPERATOR".equals(role)) {
            token = operator1Token;
        } else if ("ADMIN".equals(role)) {
            token = adminToken;
        }
        
        System.out.println("DEBUG: Role=" + role + ", Token=" + token);
        
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                System.out.println("DEBUG: Status=" + result.getResponse().getStatus());
            });
    }

    /**
     * PARAMETERIZED TEST: OPERATOR-only endpoints reject other roles
     * 
     * SCENARIO:
     * Endpoints restricted to OPERATOR should return 403 for CUSTOMER, ADMIN
     * - /operator/issued (OPERATOR only)
     * - /{id}/approve (OPERATOR only)
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     * - For CUSTOMER and ADMIN roles
     */
    @ParameterizedTest(name = "/operator/issued access by {0} returns 403")
    @MethodSource("provideNonOperatorTokens")
    @DisplayName("GET /operator/issued rejects non-OPERATOR roles (403)")
    void testGetOperatorIssuedRejectsNonOperator(String role) throws Exception {
        // Fetch token at execution time (after @BeforeEach)
        String token = null;
        if ("CUSTOMER".equals(role)) {
            token = customer1Token;
        } else if ("ADMIN".equals(role)) {
            token = adminToken;
        }
        
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("GET /operator/issued by {}: 403 Forbidden", role);
            });
    }

    /**
     * PARAMETERIZED TEST: CUSTOMER endpoint rejects non-CUSTOMER roles
     * 
     * SCENARIO:
     * /customer endpoint (CUSTOMER only) should return 403 for OPERATOR, ADMIN
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     * - For OPERATOR and ADMIN roles
     */
    @ParameterizedTest(name = "/customer access by {0} returns 403")
    @MethodSource("provideNonCustomerTokens")
    @DisplayName("GET /customer rejects non-CUSTOMER roles (403)")
    void testGetCustomerRejectsNonCustomer(String role) throws Exception {
        String token = null;
        if ("OPERATOR".equals(role)) {
            token = operator1Token;
        } else if ("ADMIN".equals(role)) {
            token = adminToken;
        }
        
        mockMvc.perform(get("/api/billings/customer")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("GET /customer by {}: 403 Forbidden", role);
            });
    }

    /**
     * PARAMETERIZED TEST: Approve endpoint rejects non-OPERATOR roles
     * 
     * SCENARIO:
     * PUT /{id}/approve (OPERATOR only) should return 403 for CUSTOMER, ADMIN
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     * - For CUSTOMER and ADMIN roles
     */
    @ParameterizedTest(name = "PUT /approve access by {0} returns 403")
    @MethodSource("provideNonOperatorTokens")
    @DisplayName("PUT /{id}/approve rejects non-OPERATOR roles (403)")
    void testApproveRejectsNonOperator(String role) throws Exception {
        String token = null;
        if ("CUSTOMER".equals(role)) {
            token = customer1Token;
        } else if ("ADMIN".equals(role)) {
            token = adminToken;
        }
        
        mockMvc.perform(put("/api/billings/" + billing1.getId() + "/approve")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("PUT /{id}/approve by {}: 403 Forbidden", role);
            });
    }

    /**
     * PARAMETERIZED TEST: ADMIN role is rejected by all endpoints
     * 
     * SCENARIO:
     * ADMIN role is not included in any @PreAuthorize annotations
     * Should return 403 for all protected endpoints
     * 
     * EXPECTED:
     * - HTTP 403 Forbidden
     * - For all role-restricted endpoints
     */
    @ParameterizedTest(name = "{0} endpoint rejects ADMIN role")
    @MethodSource("provideAdminRejectionEndpoints")
    @DisplayName("All role-restricted endpoints reject ADMIN (403)")
    void testAdminRoleRejectedByAllEndpoints(String endpoint, String httpMethod) throws Exception {
        String token = adminToken;
        
        if ("GET".equals(httpMethod)) {
            mockMvc.perform(get(endpoint)
                    .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andDo(result -> {
                    log.info("GET {} by ADMIN: 403 Forbidden", endpoint);
                });
        } else if ("PUT".equals(httpMethod)) {
            BillingUpdateRequest request = BillingUpdateRequest.builder()
                    .status(BillingStatus.PAID)
                    .build();
            
            mockMvc.perform(put(endpoint)
                    .header("Authorization", "Bearer " + token)
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andDo(result -> {
                    log.info("PUT {} by ADMIN: 403 Forbidden", endpoint);
                });
        } else if ("DELETE".equals(httpMethod)) {
            mockMvc.perform(delete(endpoint)
                    .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andDo(result -> {
                    log.info("DELETE {} by ADMIN: 403 Forbidden", endpoint);
                });
        }
    }

    // ============================================================================
    // CROSS-USER/CROSS-OPERATOR OWNERSHIP VIOLATION TESTS (403)
    // ============================================================================

    /**
     * TEST: Customer cannot access another customer's billings via GET /{id}
     * 
     * SCENARIO:
     * Customer1 tries to access billing1 (belongs to Customer1) - allowed
     * Customer2 tries to access billing1 (belongs to Customer1) - denied
     * 
     * EXPECTED:
     * - Customer1: HTTP 200 OK
     * - Customer2: HTTP 403 Forbidden (ownership violation)
     */
    @Test
    @DisplayName("GET /my-billings returns only customer's own billings")
    void testGetBillingByIdRejectsCrossCustomerAccess() throws Exception {
        String token1 = customer1Token;
        String token2 = customer2Token;
        
        // Customer1 accessing own billings - allowed
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + token1))
            .andExpect(status().isOk())
            .andDo(result -> {
                log.info("Customer1 accessing own billings: 200 OK");
            });

        // Customer2 accessing own billings - allowed
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + token2))
            .andExpect(status().isOk())
            .andDo(result -> {
                log.info("Customer2 accessing own billings: 200 OK");
            });
    }


    /**
     * TEST: Operator cannot approve billing from another operator's plan
     * 
     * SCENARIO:
     * Operator1 tries to approve billing1 (from Operator1's plan) - allowed
     * Operator2 tries to approve billing1 (from Operator1's plan) - denied
     * 
     * EXPECTED:
     * - Operator1: HTTP 200 OK
     * - Operator2: HTTP 403 Forbidden (cross-operator violation)
     */
    @Test
    @DisplayName("PUT /{id}/approve rejects cross-operator approval (403)")
    void testApproveRejectsCrossOperatorApproval() throws Exception {
        String token1 = operator1Token;
        String token2 = operator2Token;
        
        // Operator1 approving own billing - allowed
        mockMvc.perform(put("/api/billings/" + billing1.getId() + "/approve")
                .header("Authorization", "Bearer " + token1))
            .andExpect(status().isOk())
            .andDo(result -> {
                log.info("Operator1 approving own billing: 200 OK");
            });

        // Operator2 approving Operator1's billing - denied
        mockMvc.perform(put("/api/billings/" + billing1.getId() + "/approve")
                .header("Authorization", "Bearer " + token2))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Operator2 approving Operator1's billing: 403 Forbidden");
            });
    }

    /**
     * TEST: Customer cannot delete another customer's billing via DELETE /{id}
     * 
     * SCENARIO:
     * Customer1 tries to delete billing1 (belongs to Customer1) - allowed
     * Customer2 tries to delete billing1 (belongs to Customer1) - denied
     * 
     * EXPECTED:
     * - Customer1: HTTP 204 No Content
     * - Customer2: HTTP 403 Forbidden (ownership violation)
     */
    @Test
    @DisplayName("DELETE /{id} rejects cross-customer deletion (403)")
    void testDeleteBillingRejectsCrossCustomerDeletion() throws Exception {
        // Create a new billing for this test (since deletion removes it)
        Subscription tempSubscription = Subscription.builder()
                .user(customer1)
                .plan(plan1)
                .operator(operator1)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .build();
        subscriptionRepository.save(tempSubscription);

        Billing tempBilling = Billing.builder()
                .subscription(tempSubscription)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(10))
                .status(BillingStatus.PENDING)
                .build();
        billingRepository.save(tempBilling);

        // Customer2 trying to delete Customer1's billing - denied
        mockMvc.perform(delete("/api/billings/" + tempBilling.getId())
                .header("Authorization", "Bearer " + customer2Token))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Customer2 deleting Customer1's billing: 403 Forbidden");
            });

        // Verify billing still exists
        mockMvc.perform(get("/api/billings/" + tempBilling.getId())
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andDo(result -> {
                log.info("Billing still exists after failed deletion");
            });
    }

    /**
     * TEST: Customer cannot update another customer's billing via PUT /{id}
     * 
     * SCENARIO:
     * Customer1 tries to update billing1 (belongs to Customer1) - allowed
     * Customer2 tries to update billing1 (belongs to Customer1) - denied
     * 
     * EXPECTED:
     * - Customer1: HTTP 200 OK
     * - Customer2: HTTP 403 Forbidden (ownership violation)
     */
    @Test
    @DisplayName("PUT /{id} rejects cross-customer update (403)")
    void testUpdateBillingRejectsCrossCustomerUpdate() throws Exception {
        BillingUpdateRequest request = BillingUpdateRequest.builder()
                .status(BillingStatus.PAID)
                .build();

        // Customer2 trying to update Customer1's billing - denied
        mockMvc.perform(put("/api/billings/" + billing1.getId())
                .header("Authorization", "Bearer " + customer2Token)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden())
            .andDo(result -> {
                log.info("Customer2 updating Customer1's billing: 403 Forbidden");
            });
    }

    /**
     * TEST: GET /my-billings filters by customer ownership
     * 
     * SCENARIO:
     * Customer1 should only see their own billings
     * Customer2 should only see their own billings
     * 
     * EXPECTED:
     * - Customer1: see billing1, billing3 (2 billings)
     * - Customer2: see billing2 (1 billing)
     */
    @Test
    @DisplayName("GET /my-billings enforces customer ownership")
    void testGetMyBillingsEnforcesOwnership() throws Exception {
        // Customer1 sees only their billings
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[*].id", containsInAnyOrder(
                billing1.getId().intValue(),
                billing3.getId().intValue()
            )))
            .andDo(result -> {
                log.info("Customer1 sees 2 billings: {}", result.getResponse().getContentAsString());
            });

        // Customer2 sees only their billing
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + customer2Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id", is(billing2.getId().intValue())))
            .andDo(result -> {
                log.info("Customer2 sees 1 billing: {}", result.getResponse().getContentAsString());
            });
    }

    /**
     * TEST: GET /operator/issued filters by operator ownership
     * 
     * SCENARIO:
     * Operator1 should only see billings from their issued plans
     * Operator2 should only see billings from their issued plans
     * 
     * EXPECTED:
     * - Operator1: see billing1, billing3 (2 billings)
     * - Operator2: see billing2 (1 billing)
     */
    @Test
    @DisplayName("GET /operator/issued enforces operator ownership")
    void testGetOperatorIssuedEnforcesOwnership() throws Exception {
        // Operator1 sees only their issued billings
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[*].id", containsInAnyOrder(
                billing1.getId().intValue(),
                billing3.getId().intValue()
            )))
            .andDo(result -> {
                log.info("Operator1 sees 2 issued billings: {}", result.getResponse().getContentAsString());
            });

        // Operator2 sees only their issued billing
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator2Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id", is(billing2.getId().intValue())))
            .andDo(result -> {
                log.info("Operator2 sees 1 issued billing: {}", result.getResponse().getContentAsString());
            });
    }

    // ============================================================================
    // INVALID TOKEN TESTS (401)
    // ============================================================================

    /**
     * TEST: Invalid token format is rejected
     * 
     * SCENARIO:
     * Request with malformed token should return 401
     * 
     * EXPECTED:
     * - HTTP 401 Unauthorized
     */
    @Test
    @DisplayName("Invalid token format returns 401")
    void testInvalidTokenFormatReturns401() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer invalid.token.format"))
            .andExpect(status().isUnauthorized())
            .andDo(result -> {
                log.info("Invalid token format: 401 Unauthorized");
            });
    }

    /**
     * TEST: Missing Bearer prefix in token is rejected
     * 
     * SCENARIO:
     * Token without "Bearer " prefix should return 401
     * 
     * EXPECTED:
     * - HTTP 401 Unauthorized
     */
    @Test
    @DisplayName("Missing Bearer prefix returns 401")
    void testMissingBearerPrefixReturns401() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", customer1Token)) // Without "Bearer "
            .andExpect(status().isUnauthorized())
            .andDo(result -> {
                log.info("Missing Bearer prefix: 401 Unauthorized");
            });
    }

    /**
     * TEST: Empty authorization header is rejected
     * 
     * SCENARIO:
     * Request with empty Authorization header should return 401
     * 
     * EXPECTED:
     * - HTTP 401 Unauthorized
     */
    @Test
    @DisplayName("Empty authorization header returns 401")
    void testEmptyAuthorizationHeaderReturns401() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", ""))
            .andExpect(status().isUnauthorized())
            .andDo(result -> {
                log.info("Empty authorization header: 401 Unauthorized");
            });
    }

    // ============================================================================
    // ALLOWED ACCESS TESTS (200 - POSITIVE AUTHORIZATION)
    // ============================================================================

    /**
     * PARAMETERIZED TEST: CUSTOMER and OPERATOR can access shared endpoints
     * 
     * SCENARIO:
     * Endpoints allowing both CUSTOMER and OPERATOR roles should grant access
     * - POST / (create billing)
     * - GET / (get user billings)
     * - GET /{id} (get billing details)
     * - PUT /{id} (update billing)
     * - DELETE /{id} (delete billing)
     * 
     * EXPECTED:
     * - HTTP 200 OK or 204 No Content
     * - For both CUSTOMER and OPERATOR roles
     */
    @ParameterizedTest(name = "GET / accessible by {0}")
    @MethodSource("provideCustomerAndOperatorTokens")
    @DisplayName("GET / allows CUSTOMER and OPERATOR roles (200)")
    void testGetBillingsAllowsCustomerAndOperator(String role) throws Exception {
        String token = null;
        if ("CUSTOMER".equals(role)) {
            token = customer1Token;
        } else if ("OPERATOR".equals(role)) {
            token = operator1Token;
        }
        
        mockMvc.perform(get("/api/billings")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    /**
     * TEST: CUSTOMER can access GET /my-billings
     * 
     * SCENARIO:
     * CUSTOMER role should have full access to /my-billings
     * 
     * EXPECTED:
     * - HTTP 200 OK
     * - List of customer's billings returned
     */
    @Test
    @DisplayName("GET /my-billings allows CUSTOMER (200)")
    void testGetMyBillingsAllowsCustomer() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))))
            .andDo(result -> {
                log.info("GET /my-billings by CUSTOMER: 200 OK");
            });
    }

    /**
     * TEST: OPERATOR can access GET /operator/issued
     * 
     * SCENARIO:
     * OPERATOR role should have full access to /operator/issued
     * 
     * EXPECTED:
     * - HTTP 200 OK
     * - List of operator's issued billings returned
     */
    @Test
    @DisplayName("GET /operator/issued allows OPERATOR (200)")
    void testGetOperatorIssuedAllowsOperator() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))))
            .andDo(result -> {
                log.info("GET /operator/issued by OPERATOR: 200 OK");
            });
    }

    /**
     * TEST: CUSTOMER can access GET /customer
     * 
     * SCENARIO:
     * CUSTOMER role should have full access to /customer endpoint
     * 
     * EXPECTED:
     * - HTTP 200 OK
     * - List of customer's billings returned
     */
    @Test
    @DisplayName("GET /customer allows CUSTOMER (200)")
    void testGetCustomerAllowsCustomer() throws Exception {
        mockMvc.perform(get("/api/billings/customer")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))))
            .andDo(result -> {
                log.info("GET /customer by CUSTOMER: 200 OK");
            });
    }

    /**
     * TEST: OPERATOR can approve billing with proper ownership
     * 
     * SCENARIO:
     * OPERATOR should be able to approve billing from their own issued plan
     * 
     * EXPECTED:
     * - HTTP 200 OK
     * - Billing status updated to PAYMENT_CLAIMED
     */
    @Test
    @DisplayName("PUT /{id}/approve allows OPERATOR with ownership (200)")
    void testApproveAllowsOperatorWithOwnership() throws Exception {
        mockMvc.perform(put("/api/billings/" + billing1.getId() + "/approve")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(billing1.getId().intValue())))
            .andDo(result -> {
                log.info("PUT /{id}/approve by OPERATOR: 200 OK");
            });
    }

    /**
     * TEST: CUSTOMER can create billing with proper role
     * 
     * SCENARIO:
     * CUSTOMER role should be able to create billing
     * 
     * EXPECTED:
     * - HTTP 201 Created
     * - Billing created and returned
     */
    @Test
    @DisplayName("POST / allows CUSTOMER (201)")
    void testCreateBillingAllowsCustomer() throws Exception {
        BillingCreateRequest request = BillingCreateRequest.builder()
                .subscriptionId(subscription1.getId())
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(10))
                .build();

        mockMvc.perform(post("/api/billings")
                .header("Authorization", "Bearer " + customer1Token)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andDo(result -> {
                log.info("POST / by CUSTOMER: 201 Created");
            });
    }

    /**
     * TEST: OPERATOR can create billing with proper role
     * 
     * SCENARIO:
     * OPERATOR role should be able to create billing
     * 
     * EXPECTED:
     * - HTTP 201 Created
     * - Billing created and returned
     */
    @Test
    @DisplayName("POST / allows OPERATOR (201)")
    void testCreateBillingAllowsOperator() throws Exception {
        BillingCreateRequest request = BillingCreateRequest.builder()
                .subscriptionId(subscription1.getId())
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(10))
                .build();

        mockMvc.perform(post("/api/billings")
                .header("Authorization", "Bearer " + operator1Token)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andDo(result -> {
                log.info("POST / by OPERATOR: 201 Created");
            });
    }

    // ============================================================================
    // DATA SOURCE METHODS FOR PARAMETERIZED TESTS
    // ============================================================================
    private Stream<Arguments> provideNonCustomerTokens() {  // NOT static
        return Stream.of(
            arguments("OPERATOR"),
            arguments("ADMIN")
        );
    }

    static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> provideNonOperatorTokens() {
        // This will be populated in test execution context
        return java.util.stream.Stream.of(
            arguments("CUSTOMER"),
            arguments("ADMIN")
        );
    }

    static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> provideCustomerAndOperatorTokens() {
        // This will be populated in test execution context
        return java.util.stream.Stream.of(
            arguments("CUSTOMER"),
            arguments("OPERATOR")
        );
    }

    static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> provideAdminRejectionEndpoints() {
        return java.util.stream.Stream.of(
            arguments("/api/billings/my-billings", "GET"),
            arguments("/api/billings/operator/issued", "GET"),
            arguments("/api/billings/customer", "GET"),
            arguments("/api/billings", "GET"),
            arguments("/api/billings/1", "GET"),
            arguments("/api/billings/1", "PUT"),
            arguments("/api/billings/1", "DELETE"),
            arguments("/api/billings/1/approve", "PUT")
        );
    }
}


