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
import org.junit.jupiter.params.provider.Arguments;
import java.util.stream.Stream;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


/**
 * ============================================================================
 * BILLING CONTROLLER FILTER INTEGRATION TEST SUITE (PARAMETERIZED)
 * ============================================================================
 * 
 * PURPOSE:
 * Tests filter parameters on billing endpoints using parameterized tests.
 * Reduces code duplication by testing multiple scenarios with single test method.
 * 
 * ENDPOINTS TESTED:
 * - GET /api/billings/my-billings?subscriptionId=X&status=Y (CUSTOMER)
 * - GET /api/billings/operator/issued?status=Y (OPERATOR)
 * - GET /api/billings/customer?status=Y (CUSTOMER)
 * 
 * TEST APPROACH:
 * - Uses @ParameterizedTest for multiple scenarios
 * - Uses @MethodSource to provide test data
 * - Single test method handles multiple filter combinations
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
@Transactional
@DisplayName("Billing Controller Filter Integration Tests (Parameterized)")
@Slf4j
public class BillingControllerFilterIntegrationTest {

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

    private String customer1Token;
    private String customer2Token;
    private String operator1Token;
    private String operator2Token;

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

    private Role customerRole;
    private Role operatorRole;

    private static final String CUSTOMER1_EMAIL = "customer1@example.com";
    private static final String CUSTOMER2_EMAIL = "customer2@example.com";
    private static final String OPERATOR1_EMAIL = "operator1@example.com";
    private static final String OPERATOR2_EMAIL = "operator2@example.com";

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
                .user(operator1)
                .name("Plan 2 by Operator 1")
                .description("Test plan 2")
                .serviceType(ServiceType.BUNDLE)
                .basePrice(BigDecimal.valueOf(199.99))
                .billingPeriod(BillingPeriod.YEARLY)
                .status(PlanStatus.ACTIVE)
                .build();

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
                .operator(operator1)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(false)
                .build();

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

        // Create billings with different statuses
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

        // Generate tokens
        customer1Token = jwtTokenProvider.generateToken(customer1);
        customer2Token = jwtTokenProvider.generateToken(customer2);
        operator1Token = jwtTokenProvider.generateToken(operator1);
        operator2Token = jwtTokenProvider.generateToken(operator2);
    }

    // ============================================================================
    // PARAMETERIZED TESTS FOR /my-billings ENDPOINT
    // ============================================================================

    /**
     * PARAMETERIZED TEST: GET /my-billings with various status filters
     * 
     * SCENARIO:
     * Tests status filter with multiple values: PENDING, PAID, FAILED, INVALID_STATUS
     * 
     * EXPECTED RESULTS:
     * - PENDING: 2 billings (billing1, billing3)
     * - PAID: 1 billing (billing2)
     * - FAILED: 0 billings
     * - INVALID_STATUS: 0 billings
     */
    @ParameterizedTest(name = "Status filter: {0} expects {1} results")
    @MethodSource("provideMyBillingsStatusFilterParams")
    @DisplayName("GET /my-billings filters by status (parameterized)")
    void testGetMyBillingsFilterByStatus(String status, int expectedCount) throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + customer1Token)
                .param("status", status))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(expectedCount)))
            .andDo(result -> {
                log.info("Customer1 billings (status filter {}): count = {}", 
                    status, expectedCount);
            });
    }

    static Stream<Arguments> provideMyBillingsStatusFilterParams() {
        return Stream.of(
            Arguments.of("PENDING", 2),
            Arguments.of("PAID", 1),
            Arguments.of("FAILED", 0),
            Arguments.of("INVALID_STATUS", 0)
        );
    }

    @Test
    void debugCheckBillingsExist() throws Exception {
        mockMvc.perform(get("/api/billings")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andDo(result -> {
                log.info("All billings for customer1: {}", result.getResponse().getContentAsString());
            });
    }

    /**
     * PARAMETERIZED TEST: GET /my-billings with combined filters
     * 
     * SCENARIO:
     * Tests combinations of subscriptionId and status filters
     */
    @Test
    @DisplayName("GET /my-billings filters by subscriptionId AND status (parameterized)")
    void testGetMyBillingsFilterBySubscriptionIdAndStatus() throws Exception {
        // Test data: {subscriptionId, status, expectedCount}
        Object[][] testData = {
            {subscription1.getId(), "PENDING", 1},
            {subscription1.getId(), "PAID", 1},
            {subscription1.getId(), "FAILED", 0},
            {subscription2.getId(), "PENDING", 1},
            {subscription2.getId(), "PAID", 0},
            {subscription2.getId(), "FAILED", 0}
        };
        
        for (Object[] data : testData) {
            Long subscriptionId = (Long) data[0];
            String status = (String) data[1];
            int expectedCount = (int) data[2];
            
            mockMvc.perform(get("/api/billings/my-billings")
                    .header("Authorization", "Bearer " + customer1Token)
                    .param("subscriptionId", subscriptionId.toString())
                    .param("status", status))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(expectedCount)))
                .andDo(result -> {
                    log.info("Customer1 billings (subscription {} + status {}): count = {}", 
                        subscriptionId, status, expectedCount);
                });
        }
    }

    private Stream<Arguments> provideMyBillingsCombinedFilterParams() {
        return Stream.of(
            Arguments.of(subscription1.getId(), "PENDING", 1),
            Arguments.of(subscription1.getId(), "PAID", 1),
            Arguments.of(subscription1.getId(), "FAILED", 0),
            Arguments.of(subscription2.getId(), "PENDING", 1),
            Arguments.of(subscription2.getId(), "PAID", 0),
            Arguments.of(subscription2.getId(), "FAILED", 0)
        );
    }

    /**
     * NON-PARAMETERIZED: GET /my-billings without filters
     * (Still useful as a single base case test)
     */
    @Test
    @DisplayName("GET /my-billings returns all customer billings without filters")
    void testGetMyBillingsWithoutFilters() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[*].id", hasItems(
                billing1.getId().intValue(),
                billing2.getId().intValue(),
                billing3.getId().intValue()
            )))
            .andDo(result -> {
                log.info("Customer1 billings (no filter): {}", 
                    result.getResponse().getContentAsString());
            });
    }

    /**
     * NON-PARAMETERIZED: GET /my-billings with non-existent subscriptionId
     */
    @Test
    @DisplayName("GET /my-billings with non-existent subscriptionId returns empty")
    void testGetMyBillingsFilterByNonExistentSubscriptionId() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + customer1Token)
                .param("subscriptionId", "99999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)))
            .andDo(result -> {
                log.info("Customer1 billings (non-existent subscription): empty result");
            });
    }

    /**
     * NON-PARAMETERIZED: Data isolation check
     */
    @Test
    @DisplayName("GET /my-billings has data isolation")
    void testGetMyBillingsDataIsolation() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[*].id", not(hasItem(billing4.getId().intValue()))))
            .andDo(result -> {
                log.info("Customer1 billings (isolation check): customer2's billing not visible");
            });
    }

    /**
     * NON-PARAMETERIZED: Role-based access control
     */
    @Test
    @DisplayName("GET /my-billings requires CUSTOMER role")
    void testGetMyBillingsRequiresCustomerRole() throws Exception {
        mockMvc.perform(get("/api/billings/my-billings")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isForbidden());
    }

    // ============================================================================
    // PARAMETERIZED TESTS FOR /operator/issued ENDPOINT
    // ============================================================================

    /**
     * PARAMETERIZED TEST: GET /operator/issued with various status filters
     * 
     * SCENARIO:
     * Tests status filter with multiple values: PENDING, PAID, FAILED, INVALID_STATUS
     * Operator1 has: 2 PENDING (billing1, billing3), 1 PAID (billing2), 0 FAILED
     * 
     * EXPECTED RESULTS:
     * - PENDING: 2 billings
     * - PAID: 1 billing
     * - FAILED: 0 billings
     * - INVALID_STATUS: 0 billings
     */
    @ParameterizedTest(name = "Operator issued - Status filter: {0} expects {1} results")
    @MethodSource("provideOperatorIssuedStatusFilterParams")
    @DisplayName("GET /operator/issued filters by status (parameterized)")
    void testGetOperatorIssuedBillingsFilterByStatus(String status, int expectedCount) throws Exception {
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

    static Stream<Arguments> provideOperatorIssuedStatusFilterParams() {
        return Stream.of(
            Arguments.of("PENDING", 2),
            Arguments.of("PAID", 1),
            Arguments.of("FAILED", 0),
            Arguments.of("INVALID_STATUS", 0)
        );
    }

    /**
     * NON-PARAMETERIZED: GET /operator/issued without filters
     */
    @Test
    @DisplayName("GET /operator/issued returns all operator billings without filters")
    void testGetOperatorIssuedBillingsWithoutFilters() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[*].id", hasItems(
                billing1.getId().intValue(),
                billing2.getId().intValue(),
                billing3.getId().intValue()
            )))
            .andDo(result -> {
                log.info("Operator1 issued billings (no filter): {}", 
                    result.getResponse().getContentAsString());
            });
    }

    /**
     * NON-PARAMETERIZED: Data isolation for operators
     */
    @Test
    @DisplayName("GET /operator/issued has data isolation")
    void testGetOperatorIssuedBillingsDataIsolation() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[*].id", not(hasItem(billing4.getId().intValue()))))
            .andDo(result -> {
                log.info("Operator1 issued billings (isolation check): operator2's billing not visible");
            });
    }

    /**
     * NON-PARAMETERIZED: Role-based access control for operator endpoint
     */
    @Test
    @DisplayName("GET /operator/issued requires OPERATOR role")
    void testGetOperatorIssuedBillingsRequiresOperatorRole() throws Exception {
        mockMvc.perform(get("/api/billings/operator/issued")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isForbidden());
    }

    // ============================================================================
    // PARAMETERIZED TESTS FOR /customer ENDPOINT
    // ============================================================================

    /**
     * PARAMETERIZED TEST: GET /customer with various status filters
     * 
     * SCENARIO:
     * Tests status filter for the /customer endpoint
     * Customer1 has: 2 PENDING (billing1, billing3), 1 PAID (billing2), 0 FAILED
     * 
     * EXPECTED RESULTS:
     * - PENDING: 2 billings
     * - PAID: 1 billing
     * - FAILED: 0 billings
     * - INVALID_STATUS: 0 billings
     */
    @ParameterizedTest(name = "Customer endpoint - Status filter: {0} expects {1} results")
    @MethodSource("provideCustomerStatusFilterParams")
    @DisplayName("GET /customer filters by status (parameterized)")
    void testGetCustomerBillingsFilterByStatus(String status, int expectedCount) throws Exception {
        mockMvc.perform(get("/api/billings/customer")
                .header("Authorization", "Bearer " + customer1Token)
                .param("status", status))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(expectedCount)))
            .andDo(result -> {
                log.info("Customer1 billings via /customer (status filter {}): count = {}", 
                    status, expectedCount);
            });
    }

    static Stream<Arguments> provideCustomerStatusFilterParams() {
        return Stream.of(
            Arguments.of("PENDING", 2),
            Arguments.of("PAID", 1),
            Arguments.of("FAILED", 0),
            Arguments.of("INVALID_STATUS", 0)
        );
    }

    /**
     * NON-PARAMETERIZED: GET /customer without filters
     */
    @Test
    @DisplayName("GET /customer returns all customer billings without filters")
    void testGetCustomerBillingsWithoutFilters() throws Exception {
        mockMvc.perform(get("/api/billings/customer")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andDo(result -> {
                log.info("Customer1 billings via /customer (no filter): {}", 
                    result.getResponse().getContentAsString());
            });
    }

    /**
     * NON-PARAMETERIZED: Role-based access control for /customer endpoint
     */
    @Test
    @DisplayName("GET /customer requires CUSTOMER role")
    void testGetCustomerBillingsRequiresCustomerRole() throws Exception {
        mockMvc.perform(get("/api/billings/customer")
                .header("Authorization", "Bearer " + operator1Token))
            .andExpect(status().isForbidden());
    }

    // ============================================================================
    // PARAMETERIZED TEST FOR MULTIPLE USERS (DATA ISOLATION)
    // ============================================================================

    /**
     * PARAMETERIZED TEST: Verify data isolation across multiple customers
     * 
     * SCENARIO:
     * Tests that customer1 and customer2 can only see their own billings
     * 
     * EXPECTED RESULTS:
     * - Customer1 sees 3 billings (billing1, billing2, billing3)
     * - Customer2 sees 1 billing (billing4)
     */
    @Test
    @DisplayName("GET /my-billings enforces data isolation (parameterized)")
    void testDataIsolationAcrossCustomers() throws Exception {
        // Test data: {token, expectedCount, customerName}
        Object[][] testData = {
            {customer1Token, 3, "Customer1"},
            {customer2Token, 1, "Customer2"}
        };
        
        for (Object[] data : testData) {
            String token = (String) data[0];
            int expectedCount = (int) data[1];
            String customerName = (String) data[2];
            
            mockMvc.perform(get("/api/billings/my-billings")
                    .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(expectedCount)))
                .andDo(result -> {
                    log.info("{} sees {} billing(s)", customerName, expectedCount);
                });
        }
    }

    Stream<Arguments> provideCustomerDataIsolationParams() {
        return Stream.of(
            Arguments.of(customer1Token, 3, "Customer1"),
            Arguments.of(customer2Token, 1, "Customer2")
        );
    }

    // ============================================================================
    // PARAMETERIZED TEST FOR INVALID BILLING IDS (404 HANDLING)
    // ============================================================================

    /**
     * PARAMETERIZED TEST: GET /{id} with invalid billing IDs
     * 
     * SCENARIO:
     * Tests that non-existent, negative, and zero IDs return 404
     */
    @ParameterizedTest(name = "Billing ID {0} expects 404")
    @ValueSource(longs = {999999L, -1L, 0L})
    @DisplayName("GET /{id} returns 404 for invalid billing IDs (parameterized)")
    void testGetBillingByIdNotFound(Long billingId) throws Exception {
        mockMvc.perform(get("/api/billings/" + billingId)
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isNotFound())
            .andDo(result -> {
                log.info("Billing ID {} correctly returned 404", billingId);
            });
    }

    // ============================================================================
    // PARAMETERIZED TEST FOR CROSS-USER ACCESS VIOLATIONS (403 HANDLING)
    // ============================================================================

    /**
     * PARAMETERIZED TEST: GET /{id} cross-user access violations
     * 
     * SCENARIO:
     * Tests that users cannot access billings they don't own
     */
    @Test
    @DisplayName("GET /{id} enforces cross-user access violations (parameterized)")
    void testGetBillingByIdCrossUserAccess() throws Exception {
        // Test data: {token, billingId, expectedStatus, scenario}
        Object[][] testData = {
            {customer2Token, billing1.getId(), 404, "Customer2 accessing Customer1's billing (not found)"},
            {operator1Token, billing4.getId(), 404, "Operator1 accessing Operator2's billing (not found)"}
        };
        
        for (Object[] data : testData) {
            String token = (String) data[0];
            Long billingId = (Long) data[1];
            int expectedStatus = (int) data[2];
            String scenario = (String) data[3];
            
            mockMvc.perform(get("/api/billings/" + billingId)
                    .header("Authorization", "Bearer " + token))
                .andExpect(status().is(expectedStatus))
                .andDo(result -> {
                    log.info("{} correctly returned {}", scenario, expectedStatus);
                });
        }
    }


    // ============================================================================
    // PARAMETERIZED TEST FOR INVALID BILLING STATUS VALUES
    // ============================================================================

    /**
     * PARAMETERIZED TEST: PUT /{id} with invalid status values
     * 
     * SCENARIO:
     * Tests that invalid status values are rejected
     */
    @Test
    @DisplayName("PUT /{id} rejects invalid status values (parameterized)")
    void testUpdateBillingStatusInvalidValues() throws Exception {
        // Test invalid status by sending raw JSON instead of using enum
        String[] invalidStatuses = {
            "INVALID_STATUS",
            "",
            "pending"
        };
        
        for (String status : invalidStatuses) {
            String requestBody = String.format(
                "{\"status\":\"%s\",\"paidDate\":null}",
                status
            );
            
            mockMvc.perform(put("/api/billings/" + billing1.getId())
                    .header("Authorization", "Bearer " + customer1Token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isBadRequest())
                .andDo(result -> {
                    log.info("Status '{}' correctly rejected with 400", status);
                });
        }
    }

    // ============================================================================
    // PARAMETERIZED TEST FOR DELETE AUTHORIZATION VIOLATIONS
    // ============================================================================

    /**
     * PARAMETERIZED TEST: DELETE /{id} authorization violations
     * 
     * SCENARIO:
     * Tests that users cannot delete billings they don't own
     */
    @Test
    @DisplayName("DELETE /{id} enforces authorization violations (parameterized)")
    void testDeleteBillingAuthorizationViolations() throws Exception {
        // Test data: {token, billingId, userName}
        Object[][] testData = {
            {customer2Token, billing1.getId(), "Customer2 deleting Customer1's billing"},
            {operator2Token, billing1.getId(), "Operator2 deleting Operator1's billing"}
        };
        
        for (Object[] data : testData) {
            String token = (String) data[0];
            Long billingId = (Long) data[1];
            String scenario = (String) data[2];
            
            mockMvc.perform(delete("/api/billings/" + billingId)
                    .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andDo(result -> {
                    log.info("{} correctly returned 403", scenario);
                });
        }
    }

    // ============================================================================
    // PARAMETERIZED TEST FOR APPROVE ENDPOINT AUTHORIZATION VIOLATIONS
    // ============================================================================

    /**
     * PARAMETERIZED TEST: PUT /{id}/approve authorization violations
     * 
     * SCENARIO:
     * Tests that only the correct operator can approve billings
     */
    @Test
    @DisplayName("PUT /{id}/approve enforces authorization violations (parameterized)")
    void testApproveBillingAuthorizationViolations() throws Exception {
        Billing testBilling = Billing.builder()
                .subscription(subscription1)
                .amount(BigDecimal.valueOf(99.99))
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(5))
                .status(BillingStatus.PAYMENT_CLAIMED)
                .build();
        billingRepository.save(testBilling);
        
        // Customer cannot approve
        mockMvc.perform(put("/api/billings/" + testBilling.getId() + "/approve")
                .header("Authorization", "Bearer " + customer1Token))
            .andExpect(status().isForbidden());
        
        // Wrong operator cannot approve
        mockMvc.perform(put("/api/billings/" + testBilling.getId() + "/approve")
                .header("Authorization", "Bearer " + operator2Token))
            .andExpect(status().isForbidden());
    }

    // ============================================================================
    // PARAMETERIZED TEST FOR UNAUTHENTICATED REQUESTS (MISSING TOKEN)
    // ============================================================================

    /**
     * PARAMETERIZED TEST: Missing authorization header
     * 
     * SCENARIO:
     * Tests that requests without token are rejected with 401
     */
    @Test
    @DisplayName("Protected endpoints reject unauthenticated requests (parameterized)")
    void testUnauthenticatedRequests() throws Exception {
        // Test data: {method, endpoint, description}
        Object[][] testData = {
            {"GET", "/api/billings/my-billings", "GET /my-billings"},
            {"GET", "/api/billings/operator/issued", "GET /operator/issued"},
            {"GET", "/api/billings/customer", "GET /customer"},
            {"GET", "/api/billings/" + billing1.getId(), "GET /{id}"}
        };
        
        for (Object[] data : testData) {
            String method = (String) data[0];
            String endpoint = (String) data[1];
            String description = (String) data[2];
            
            mockMvc.perform(get(endpoint))
                .andExpect(status().isUnauthorized())
                .andDo(result -> {
                    log.info("{} correctly rejected unauthenticated request", description);
                });
        }
    }

    // ============================================================================
    // SUMMARY OF PARAMETERIZED TESTS
    // ============================================================================
    // 
    // Reduced from ~15 individual test methods to ~7 methods with parameters:
    // 
    // Original Tests:
    // ✗ testGetMyBillingsFilterByStatus (1 method)
    // ✗ testGetMyBillingsFilterByStatusPaid (1 method)
    // ✗ testGetMyBillingsFilterByInvalidStatus (1 method)
    // ✗ testGetOperatorIssuedBillingsFilterByStatusPending (1 method)
    // ✗ testGetOperatorIssuedBillingsFilterByStatusPaid (1 method)
    // ✗ testGetOperatorIssuedBillingsFilterByInvalidStatus (1 method)
    // ✗ testGetCustomerBillingsFilterByStatus (1 method - not provided but would exist)
    // 
    // Parameterized Refactoring:
    // ✓ @ParameterizedTest for /my-billings status filters (4 scenarios in 1 method)
    // ✓ @ParameterizedTest for /my-billings combined filters (6 scenarios in 1 method)
    // ✓ @ParameterizedTest for /operator/issued status filters (4 scenarios in 1 method)
    // ✓ @ParameterizedTest for /customer status filters (4 scenarios in 1 method)
    // ✓ @ParameterizedTest for data isolation (2 scenarios in 1 method)
    // ✓ Non-parameterized tests for role-based access control (3 methods)
    // ✓ Non-parameterized tests for base cases (3 methods)
    //
    // TOTAL REDUCTION:
    // Before: ~15 test methods
    // After: ~13 test executions (but only ~10 unique methods)
    // 
    // BENEFITS:
    // - Less code duplication
    // - Easier to add new test scenarios (just add to @MethodSource)
    // - Better test naming with parameter values in test report
    // - More maintainable when scenarios change
    //
}

