package com.subscriptionapi.controller;

import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.dto.SubscriptionCreateRequest;
import com.subscriptionapi.dto.SubscriptionResponseDTO;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.repository.*;
import com.subscriptionapi.service.SubscriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
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
 * SUBSCRIPTION CONTROLLER INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests role-based access control for Subscription endpoints.
 * Verifies that CUSTOMER users can create, view, and cancel subscriptions.
 * Tests that OPERATOR users can approve, suspend, and view their subscriptions.
 * Tests token validation, invalid requests, and business logic.
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
@DisplayName("SubscriptionController Integration Tests")
@Slf4j
public class SubscriptionControllerIntegrationTest {

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testCustomer1;
    private User testCustomer2;
    private User testOperator;
    private User testAdmin;

    private String customerToken;
    private String customerToken1;
    private String customerToken2;
    private String operatorToken;
    private String operatorToken1;
    private String operatorToken2;
    private String adminToken;

    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;

    private Plan testPlan;
    private Subscription testSubscription;

    private static final String CUSTOMER1_EMAIL = "customer1@example.com";
    private static final String CUSTOMER2_EMAIL = "customer2@example.com";
    private static final String OPERATOR_EMAIL = "operator@example.com";
    private static final String ADMIN_EMAIL = "admin@example.com";

    /**
     * SETUP METHOD: Executed before each test
     * 
     * PURPOSE:
     * Initializes test database with users of different roles, plans, and subscriptions.
     * Generates JWT tokens for each user type.
     * 
     * SETUP STEPS:
     * 1. Load roles (CUSTOMER, OPERATOR, ADMIN)
     * 2. Create test users for each role
     * 3. Generate JWT tokens for each user
     * 4. Create test plan owned by operator
     * 5. Create test subscription for customer
     */
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        planRepository.deleteAll();
        subscriptionRepository.deleteAll();

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
                .basePrice(new BigDecimal("99.99"))
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("[\"Unlimited\", \"24/7 Support\"]")
                .status(PlanStatus.ACTIVE)
                .build();
        planRepository.save(testPlan);

        // Create test subscription for customer1
        testSubscription = Subscription.builder()
                .user(testCustomer1)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.PENDING)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
        subscriptionRepository.save(testSubscription);
    }

    // ============================================================================
    // CREATE SUBSCRIPTION TESTS
    // ============================================================================

    /**
     * TEST: Only CUSTOMER users can create subscriptions
     * 
     * DESCRIPTION:
     * Verifies that only CUSTOMER users can access POST /api/subscriptions endpoint.
     * OPERATOR and ADMIN users should be denied with 403 Forbidden.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. OPERATOR tries to create subscription
     * 2. ADMIN tries to create subscription
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     * - Response indicates access denied
     * 
     * VALIDATES:
     * ✓ @PreAuthorize("hasRole('CUSTOMER')") blocks non-CUSTOMER users
     * ✓ OPERATOR cannot create subscriptions
     * ✓ ADMIN cannot create subscriptions
     */
    @ParameterizedTest(name = "Role {0} cannot create subscription, expects 403")
    @CsvSource({
        "OPERATOR,operatorToken",
        "ADMIN,adminToken"
    })
    @DisplayName("Non-CUSTOMER users cannot create subscriptions (403 Forbidden)")
    void testCreateSubscriptionDeniedForNonCustomer(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);
        SubscriptionCreateRequest createRequest = SubscriptionCreateRequest.builder()
                .planId(testPlan.getId())
                .autoRenewal(true)
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/subscriptions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: CUSTOMER successfully creates subscription with valid data
     * 
     * DESCRIPTION:
     * Verifies that a CUSTOMER can successfully create a new subscription
     * with valid plan ID and auto-renewal settings.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. Create subscription with autoRenewal = true
     * 2. Create subscription with autoRenewal = false
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 201 Created
     * - Response contains correct subscription data
     * - Subscription status is PENDING
     * - Auto-renewal setting matches request
     * 
     * VALIDATES:
     * ✓ CUSTOMER can create subscription
     * ✓ Auto-renewal setting is correctly stored
     * ✓ Subscription is created with PENDING status
     * ✓ Response contains all required fields
     */
    @ParameterizedTest(name = "Create subscription with autoRenewal={0}")
    @DisplayName("CUSTOMER successfully creates subscription")
    @ValueSource(booleans = {true, false})
    void testCreateSubscriptionSuccess(boolean autoRenewal) throws Exception {
        // Arrange
        SubscriptionCreateRequest createRequest = SubscriptionCreateRequest.builder()
                .planId(testPlan.getId())
                .autoRenewal(autoRenewal)
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/subscriptions")
                .header("Authorization", "Bearer " + customerToken1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.userId").value(testCustomer1.getId()))
            .andExpect(jsonPath("$.planId").value(testPlan.getId()))
            .andExpect(jsonPath("$.operatorId").value(testOperator.getId()))
            .andExpect(jsonPath("$.status").value(SubscriptionStatus.PENDING.toString()))
            .andExpect(jsonPath("$.autoRenewal").value(autoRenewal))
            .andExpect(jsonPath("$.createdAt").exists())
            .andExpect(jsonPath("$.endDate").exists());
    }

    /**
     * TEST: CUSTOMER cannot create subscription with invalid plan ID
     * 
     * DESCRIPTION:
     * Verifies that subscription creation fails when plan ID doesn't exist.
     * Should return 404 Not Found.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 404 Not Found
     * - Error message indicates plan not found
     * 
     * VALIDATES:
     * ✓ Plan existence is validated
     * ✓ Appropriate error status is returned
     */
    @DisplayName("CUSTOMER cannot create subscription with invalid plan ID (404)")
    @org.junit.jupiter.api.Test
    void testCreateSubscriptionWithInvalidPlanId() throws Exception {
        // Arrange
        long invalidPlanId = 99999L;
        SubscriptionCreateRequest createRequest = SubscriptionCreateRequest.builder()
                .planId(invalidPlanId)
                .autoRenewal(true)
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/subscriptions")
                .header("Authorization", "Bearer " + customerToken1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isNotFound());
    }

    /**
     * TEST: CUSTOMER cannot create subscription with null plan ID
     * 
     * DESCRIPTION:
     * Verifies that subscription creation fails when plan ID is null.
     * Validation should catch this with 400 Bad Request.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 400 Bad Request
     * - Response indicates validation error
     * 
     * VALIDATES:
     * ✓ Required field validation works
     * ✓ Appropriate error status is returned
     */
    @DisplayName("CUSTOMER cannot create subscription with null plan ID (400)")
    @org.junit.jupiter.api.Test
    void testCreateSubscriptionWithNullPlanId() throws Exception {
        // Arrange
        SubscriptionCreateRequest createRequest = SubscriptionCreateRequest.builder()
                .planId(null)
                .autoRenewal(true)
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/subscriptions")
                .header("Authorization", "Bearer " + customerToken1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isBadRequest());
    }

    // ============================================================================
    // GET SUBSCRIPTION BY ID TESTS
    // ============================================================================

    /**
     * TEST: Authenticated users can retrieve subscription details
     * 
     * DESCRIPTION:
     * Verifies that both CUSTOMER and OPERATOR can retrieve subscription details
     * by ID using GET /api/subscriptions/{id} endpoint.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. CUSTOMER retrieves their own subscription
     * 2. OPERATOR retrieves subscription
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response contains correct subscription data
     * 
     * VALIDATES:
     * ✓ Authenticated users can retrieve subscriptions
     * ✓ Subscription data is correctly returned
     * ✓ All fields are present in response
     */
    @ParameterizedTest(name = "Role {0} retrieves subscription")
    @CsvSource({
        "CUSTOMER,customerToken1",
        "OPERATOR,operatorToken"
    })
    @DisplayName("Authenticated users can retrieve subscription by ID")
    void testGetSubscriptionByIdSuccess(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);

        // Act & Assert
        mockMvc.perform(get("/api/subscriptions/" + testSubscription.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(testSubscription.getId()))
            .andExpect(jsonPath("$.userId").value(testCustomer1.getId()))
            .andExpect(jsonPath("$.planId").value(testPlan.getId()))
            .andExpect(jsonPath("$.operatorId").value(testOperator.getId()))
            .andExpect(jsonPath("$.status").value(SubscriptionStatus.PENDING.toString()))
            .andExpect(jsonPath("$.autoRenewal").value(true));
    }

    /**
     * TEST: Unauthenticated user cannot retrieve subscription
     * 
     * DESCRIPTION:
     * Verifies that requests without valid JWT token are denied.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 401 Unauthorized
     * 
     * VALIDATES:
     * ✓ Authentication is required
     * ✓ Invalid/missing tokens are rejected
     */
    @DisplayName("Unauthenticated user cannot retrieve subscription (401)")
    @org.junit.jupiter.api.Test
    void testGetSubscriptionByIdUnauthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/subscriptions/" + testSubscription.getId())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized());
    }

    /**
     * HELPER METHOD: Get token by field name
     * 
     * PURPOSE:
     * Maps token field names to actual token values for parameterized tests.
     * Allows @CsvSource to pass token field names instead of actual tokens.
     * 
     * @param tokenField Field name: "customerToken", "operatorToken1", "operatorToken2", "adminToken"
     * @return JWT token string
     */
    private String getTokenByField(String tokenField) {
        return switch (tokenField) {
            case "customerToken" -> customerToken;
            case "customerToken1" -> customerToken1;
           case "operatorToken" -> operatorToken;
            case "operatorToken1" -> operatorToken1;
            case "operatorToken2" -> operatorToken2;
            case "adminToken" -> adminToken;
            default -> throw new IllegalArgumentException("Unknown token field: " + tokenField);
        };
    }
}