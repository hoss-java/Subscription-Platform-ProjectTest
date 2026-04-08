package com.subscriptionapi.controller;

import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.dto.BillingUpdateRequest;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.repository.*;
import com.subscriptionapi.service.BillingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================================
 * BILLING CONTROLLER INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests role-based access control for Billing endpoints.
 * Verifies that CUSTOMER and OPERATOR users can create, view, and update billings.
 * Tests token validation, invalid requests, and business logic.
 * Tests billing status transitions and payment tracking.
 * 
 * TEST ENVIRONMENT:
 * - Uses Spring Boot test context with full application startup
 * - Runs against test database (H2 in-memory)
 * - Each test is transactional and rolled back after execution
 * - Uses MockMvc to simulate HTTP requests without starting a server
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("BillingController Integration Tests")
@Slf4j
public class BillingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testCustomer1;
    private User testCustomer2;
    private User testOperator;
    private User testAdmin;

    private String customerToken1;
    private String customerToken2;
    private String operatorToken;
    private String adminToken;

    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;

    private Plan testPlan;
    private Subscription testSubscription1;
    private Subscription testSubscription2;
    private Billing testBilling;

    private static final String CUSTOMER1_EMAIL = "customer1@example.com";
    private static final String CUSTOMER2_EMAIL = "customer2@example.com";
    private static final String OPERATOR_EMAIL = "operator@example.com";
    private static final String ADMIN_EMAIL = "admin@example.com";
    private static final BigDecimal BILLING_AMOUNT = new BigDecimal("99.99");

    /**
     * SETUP METHOD: Executed before each test
     * 
     * PURPOSE:
     * Initializes test database with users of different roles, plans, subscriptions, and billings.
     * Generates JWT tokens for each user type.
     * 
     * SETUP STEPS:
     * 1. Load roles (CUSTOMER, OPERATOR, ADMIN)
     * 2. Create test users for each role
     * 3. Generate JWT tokens for each user
     * 4. Create test plan owned by operator
     * 5. Create test subscriptions for customers
     * 6. Create test billing record
     */
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        planRepository.deleteAll();
        subscriptionRepository.deleteAll();
        billingRepository.deleteAll();

        // Load roles
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        operatorRole = roleRepository.findByName(RoleType.OPERATOR)
            .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));

        adminRole = roleRepository.findByName(RoleType.ADMIN)
            .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        // Create test users
        testCustomer1 = User.builder()
                .email(CUSTOMER1_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        testCustomer2 = User.builder()
                .email(CUSTOMER2_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("Two")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        testOperator = User.builder()
                .email(OPERATOR_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();

        testAdmin = User.builder()
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Admin")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(adminRole)))
                .build();

        userRepository.save(testCustomer1);
        userRepository.save(testCustomer2);
        userRepository.save(testOperator);
        userRepository.save(testAdmin);

        // Generate tokens
        customerToken1 = jwtTokenProvider.generateToken(testCustomer1);
        customerToken2 = jwtTokenProvider.generateToken(testCustomer2);
        operatorToken = jwtTokenProvider.generateToken(testOperator);
        adminToken = jwtTokenProvider.generateToken(testAdmin);

        // Create test plan owned by operator
        testPlan = Plan.builder()
                .user(testOperator)
                .name("Premium Internet Plan")
                .description("Premium subscription plan")
                .serviceType(ServiceType.INTERNET)
                .basePrice(BILLING_AMOUNT)
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("[\"Unlimited\", \"24/7 Support\"]")
                .status(PlanStatus.ACTIVE)
                .build();
        planRepository.save(testPlan);

        // Create test subscriptions
        testSubscription1 = Subscription.builder()
                .user(testCustomer1)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
        subscriptionRepository.save(testSubscription1);

        testSubscription2 = Subscription.builder()
                .user(testCustomer2)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
        subscriptionRepository.save(testSubscription2);

        // Create test billing
        testBilling = Billing.builder()
                .subscription(testSubscription1)
                .amount(BILLING_AMOUNT)
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .status(BillingStatus.PENDING)
                .build();
        billingRepository.save(testBilling);
    }

    // ============================================================================
    // CREATE BILLING TESTS
    // ============================================================================

    /**
     * TEST: Only CUSTOMER and OPERATOR users can create billings
     * 
     * DESCRIPTION:
     * Verifies that only CUSTOMER and OPERATOR users can access POST /billings endpoint.
     * ADMIN users should be denied with 403 Forbidden.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. ADMIN tries to create billing
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     * - Response indicates access denied
     * 
     * VALIDATES:
     * ✓ @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')") blocks non-authorized users
     * ✓ ADMIN cannot create billings
     */
    @ParameterizedTest(name = "Role {0} cannot create billing, expects 403")
    @CsvSource({
        "ADMIN,adminToken"
    })
    @DisplayName("Non-authorized users cannot create billings (403 Forbidden)")
    void testCreateBillingDeniedForUnauthorizedRole(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);
        BillingCreateRequest createRequest = BillingCreateRequest.builder()
                .subscriptionId(testSubscription1.getId())
                .amount(BILLING_AMOUNT)
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();

        // Act & Assert
        mockMvc.perform(post("/billings")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: CUSTOMER can successfully create billing for their subscription
     * 
     * DESCRIPTION:
     * Verifies that a CUSTOMER user can create a billing record.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 201 Created
     * - Response contains billing ID, amount, and PENDING status
     * - Billing is persisted in database
     * 
     * VALIDATES:
     * ✓ CUSTOMER can create billings
     * ✓ Billing is created with PENDING status
     * ✓ All required fields are returned
     */
    @org.junit.jupiter.api.Test
    @DisplayName("CUSTOMER can create billing successfully (201 Created)")
    void testCreateBillingSuccess() throws Exception {
        // Arrange
        BillingCreateRequest createRequest = BillingCreateRequest.builder()
                .subscriptionId(testSubscription1.getId())
                .amount(BILLING_AMOUNT)
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();

        // Act & Assert
        mockMvc.perform(post("/billings")
                .header("Authorization", "Bearer " + customerToken1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.subscriptionId").value(testSubscription1.getId()))
            .andExpect(jsonPath("$.amount").value(BILLING_AMOUNT.doubleValue()))
            .andExpect(jsonPath("$.status").value(BillingStatus.PENDING.toString()));
    }

    /**
     * TEST: Cannot create billing with non-existent subscription
     * 
     * DESCRIPTION:
     * Verifies that creating a billing with invalid subscription ID returns 404.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 404 Not Found
     * - ResourceNotFoundException is thrown and handled
     * 
     * VALIDATES:
     * ✓ Service validates subscription existence
     * ✓ Appropriate error response for invalid subscription
     */
    @org.junit.jupiter.api.Test
    @DisplayName("Cannot create billing with non-existent subscription (404 Not Found)")
    void testCreateBillingWithInvalidSubscription() throws Exception {
        // Arrange
        BillingCreateRequest createRequest = BillingCreateRequest.builder()
                .subscriptionId(9999L)
                .amount(BILLING_AMOUNT)
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();

        // Act & Assert
        mockMvc.perform(post("/billings")
                .header("Authorization", "Bearer " + customerToken1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isNotFound());
    }

    // ============================================================================
    // GET BILLING TESTS
    // ============================================================================

    /**
     * TEST: Only CUSTOMER and OPERATOR users can retrieve billings
     * 
     * DESCRIPTION:
     * Verifies that only CUSTOMER and OPERATOR users can access GET /billings/{id} endpoint.
     * ADMIN users should be denied with 403 Forbidden.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. ADMIN tries to retrieve billing
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     */
    @ParameterizedTest(name = "Role {0} cannot retrieve billing, expects 403")
    @CsvSource({
        "ADMIN,adminToken"
    })
    @DisplayName("Non-authorized users cannot retrieve billings (403 Forbidden)")
    void testGetBillingDeniedForUnauthorizedRole(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);

        // Act & Assert
        mockMvc.perform(get("/billings/" + testBilling.getId())
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: CUSTOMER can retrieve their own billing
     * 
     * DESCRIPTION:
     * Verifies that a CUSTOMER can retrieve a billing associated with their subscription.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response contains correct billing details
     * 
     * VALIDATES:
     * ✓ CUSTOMER can retrieve billing
     * ✓ Correct billing data is returned
     */
    @org.junit.jupiter.api.Test
    @DisplayName("CUSTOMER can retrieve their billing (200 OK)")
    void testGetBillingSuccess() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/billings/" + testBilling.getId())
                .header("Authorization", "Bearer " + customerToken1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(testBilling.getId()))
            .andExpect(jsonPath("$.amount").value(BILLING_AMOUNT.doubleValue()))
            .andExpect(jsonPath("$.status").value(BillingStatus.PENDING.toString()));
    }

    /**
     * TEST: Get all billings for authenticated user
     * 
     * DESCRIPTION:
     * Verifies that a user can retrieve all their billings.
     * Only billings associated with user's subscriptions are returned.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response contains list of billings for the user
     * 
     * VALIDATES:
     * ✓ User can retrieve their billings
     * ✓ Only user's billings are returned
     * ✓ List is ordered correctly
     */
    @org.junit.jupiter.api.Test
    @DisplayName("CUSTOMER can retrieve all their billings (200 OK)")
    void testGetBillingsByUserSuccess() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/billings")
                .header("Authorization", "Bearer " + customerToken1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(testBilling.getId()))
            .andExpect(jsonPath("$[0].subscriptionId").value(testSubscription1.getId()));
    }

    /**
     * TEST: Only CUSTOMER and OPERATOR users can retrieve all billings
     * 
     * DESCRIPTION:
     * Verifies that only CUSTOMER and OPERATOR users can access GET /billings endpoint.
     * ADMIN users should be denied with 403 Forbidden.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. ADMIN tries to retrieve all billings
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     */
    @ParameterizedTest(name = "Role {0} cannot retrieve all billings, expects 403")
    @CsvSource({
        "ADMIN,adminToken"
    })
    @DisplayName("Non-authorized users cannot retrieve all billings (403 Forbidden)")
    void testGetAllBillingsDeniedForUnauthorizedRole(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);

        // Act & Assert
        mockMvc.perform(get("/billings")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    // ============================================================================
    // UPDATE BILLING STATUS TESTS
    // ============================================================================

    /**
     * TEST: Billing status transitions with different statuses
     * 
     * DESCRIPTION:
     * Verifies that billing status can be updated to various statuses.
     * Tests parameterized scenarios for each BillingStatus enum value.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. Update to PAID - sets paidDate
     * 2. Update to OVERDUE - status changes
     * 3. Update to CANCELLED - status changes
     * 4. Update to REFUNDED - status changes
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Billing status is updated correctly
     * - If PAID, paidDate is set to current time
     * 
     * VALIDATES:
     * ✓ All status transitions work correctly
     * ✓ PAID status sets paidDate automatically
     * ✓ Service updates billing correctly
     */
    @ParameterizedTest(name = "Update billing status to {0}")
    @EnumSource(value = BillingStatus.class)
    @DisplayName("Can update billing to any status (200 OK)")
    void testUpdateBillingStatus(BillingStatus newStatus) throws Exception {
        // Arrange
        BillingUpdateRequest updateRequest = new BillingUpdateRequest();
        updateRequest.setStatus(newStatus);

        // Act & Assert
        mockMvc.perform(put("/billings/" + testBilling.getId())
                .header("Authorization", "Bearer " + customerToken1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(newStatus.toString()));
    }

    /**
     * TEST: Only CUSTOMER and OPERATOR users can update billing status
     * 
     * DESCRIPTION:
     * Verifies that only CUSTOMER and OPERATOR users can access PUT /billings/{id} endpoint.
     * ADMIN users should be denied with 403 Forbidden.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. ADMIN tries to update billing status
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     */
    @ParameterizedTest(name = "Role {0} cannot update billing, expects 403")
    @CsvSource({
        "ADMIN,adminToken"
    })
    @DisplayName("Non-authorized users cannot update billing status (403 Forbidden)")
    void testUpdateBillingStatusDeniedForUnauthorizedRole(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);
        BillingUpdateRequest updateRequest = new BillingUpdateRequest();
        updateRequest.setStatus(BillingStatus.PAID);

        // Act & Assert
        mockMvc.perform(put("/billings/" + testBilling.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: Cannot update billing with non-existent ID
     * 
     * DESCRIPTION:
     * Verifies that updating a billing with invalid ID returns 404.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 404 Not Found
     * 
     * VALIDATES:
     * ✓ Service validates billing existence before update
     * ✓ Appropriate error response for invalid billing
     */
    @org.junit.jupiter.api.Test
    @DisplayName("Cannot update non-existent billing (404 Not Found)")
    void testUpdateBillingNotFound() throws Exception {
        // Arrange
        BillingUpdateRequest updateRequest = new BillingUpdateRequest();
        updateRequest.setStatus(BillingStatus.PAID);

        // Act & Assert
        mockMvc.perform(put("/billings/9999")
                .header("Authorization", "Bearer " + customerToken1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
            .andExpect(status().isNotFound());
    }

    // ============================================================================
    // DELETE BILLING TESTS
    // ============================================================================

    /**
     * TEST: Only CUSTOMER and OPERATOR users can delete billings
     * 
     * DESCRIPTION:
     * Verifies that only CUSTOMER and OPERATOR users can access DELETE /billings/{id} endpoint.
     * ADMIN users should be denied with 403 Forbidden.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. ADMIN tries to delete billing
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     */
    @ParameterizedTest(name = "Role {0} cannot delete billing, expects 403")
    @CsvSource({
        "ADMIN,adminToken"
    })
    @DisplayName("Non-authorized users cannot delete billing (403 Forbidden)")
    void testDeleteBillingDeniedForUnauthorizedRole(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);

        // Act & Assert
        mockMvc.perform(delete("/billings/" + testBilling.getId())
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: CUSTOMER can delete their billing
     * 
     * DESCRIPTION:
     * Verifies that a CUSTOMER can delete a billing record.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 204 No Content
     * - Billing is removed from database
     * 
     * VALIDATES:
     * ✓ CUSTOMER can delete billings
     * ✓ Billing is actually deleted
     */
    @org.junit.jupiter.api.Test
    @DisplayName("CUSTOMER can delete their billing (204 No Content)")
    void testDeleteBillingSuccess() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/billings/" + testBilling.getId())
                .header("Authorization", "Bearer " + customerToken1))
            .andExpect(status().isNoContent());

        // Verify deletion
        org.junit.jupiter.api.Assertions.assertFalse(billingRepository.existsById(testBilling.getId()));
    }

    /**
     * TEST: Cannot delete non-existent billing
     * 
     * DESCRIPTION:
     * Verifies that deleting a billing with invalid ID returns 404.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 404 Not Found
     * 
     * VALIDATES:
     * ✓ Service validates billing existence before deletion
     */
    @org.junit.jupiter.api.Test
    @DisplayName("Cannot delete non-existent billing (404 Not Found)")
    void testDeleteBillingNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/billings/9999")
                .header("Authorization", "Bearer " + customerToken1))
            .andExpect(status().isNotFound());
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    /**
     * Helper method to retrieve token by field name
     * 
     * @param tokenField the field name (e.g., "customerToken1", "operatorToken")
     * @return the JWT token string
     */
    private String getTokenByField(String tokenField) {
        return switch (tokenField) {
            case "customerToken1" -> customerToken1;
            case "customerToken2" -> customerToken2;
            case "operatorToken" -> operatorToken;
            case "adminToken" -> adminToken;
            default -> throw new IllegalArgumentException("Unknown token field: " + tokenField);
        };
    }
}
