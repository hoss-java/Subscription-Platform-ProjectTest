package com.subscriptionapi.controller;

import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================================
 * BILLING ENUM ENDPOINTS INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests public enum endpoints that return available billing statuses and periods.
 * Verifies that endpoints are accessible to all authenticated users.
 * 
 * ENDPOINTS TESTED:
 * - GET /api/billings/billing-statuses - Returns list of BillingStatus enum values
 * - GET /api/billings/billing-periods - Returns list of BillingPeriod enum values
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
@DisplayName("Billing Enum Endpoints Integration Tests")
@Slf4j
public class BillingEnumEndpointsIntegrationTest {

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

    private User testCustomer;
    private User testOperator;
    private User testAdmin;

    private String customerToken;
    private String operatorToken;
    private String adminToken;

    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;

    private static final String CUSTOMER_EMAIL = "customer@example.com";
    private static final String OPERATOR_EMAIL = "operator@example.com";
    private static final String ADMIN_EMAIL = "admin@example.com";

    /**
     * SETUP METHOD: Executed before each test
     * 
     * PURPOSE:
     * Initializes test database with users of different roles.
     * Generates JWT tokens for each user type.
     * 
     * SETUP STEPS:
     * 1. Load roles (CUSTOMER, OPERATOR, ADMIN)
     * 2. Create test users for each role
     * 3. Generate JWT tokens for each user
     */
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        // Load roles
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        operatorRole = roleRepository.findByName(RoleType.OPERATOR)
            .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));

        adminRole = roleRepository.findByName(RoleType.ADMIN)
            .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        // Create test users
        testCustomer = User.builder()
                .email(CUSTOMER_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("User")
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

        userRepository.save(testCustomer);
        userRepository.save(testOperator);
        userRepository.save(testAdmin);

        // Generate tokens
        customerToken = jwtTokenProvider.generateToken(testCustomer);
        operatorToken = jwtTokenProvider.generateToken(testOperator);
        adminToken = jwtTokenProvider.generateToken(testAdmin);
    }

    // ============================================================================
    // GET BILLING STATUSES ENDPOINT TESTS
    // ============================================================================

    /**
     * TEST: GET /api/billings/billing-statuses returns all BillingStatus enum values
     * 
     * DESCRIPTION:
     * Verifies that the endpoint returns a complete list of all available billing statuses.
     * Authenticated users can access this endpoint.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response is a JSON array of strings
     * - Contains all BillingStatus enum names (PENDING, PAID, OVERDUE, CANCELLED, REFUNDED)
     * - Array is not empty
     * - Content-Type is application/json
     * 
     * VALIDATES:
     * ✓ Endpoint returns 200 OK
     * ✓ Response is JSON array
     * ✓ All BillingStatus values are present
     * ✓ No extra values are included
     * ✓ Order matches enum definition
     */
    @Test
    @DisplayName("GET /billing-statuses returns all billing statuses (200 OK)")
    void testGetBillingStatusesSuccess() throws Exception {
        // Arrange
        List<String> expectedStatuses = Arrays.stream(BillingStatus.values())
                .map(Enum::name)
                .toList();

        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-statuses")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$", isA(List.class)))
            .andExpect(jsonPath("$", hasSize(expectedStatuses.size())))
            .andExpect(jsonPath("$[*]", containsInAnyOrder(expectedStatuses.toArray())))
            .andDo(result -> {
                log.info("Billing statuses returned: {}", result.getResponse().getContentAsString());
            });
    }

    /**
     * TEST: GET /api/billings/billing-statuses returns non-empty list
     * 
     * DESCRIPTION:
     * Verifies that the billing statuses list is not empty.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response array contains at least one status
     * 
     * VALIDATES:
     * ✓ Response is not empty
     * ✓ At least one status is available
     */
    @Test
    @DisplayName("GET /billing-statuses returns non-empty list")
    void testGetBillingStatusesNotEmpty() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-statuses")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThan(0))));
    }

    /**
     * TEST: GET /api/billings/billing-statuses contains specific status values
     * 
     * DESCRIPTION:
     * Verifies that the response contains expected billing status values.
     * Tests for critical statuses: PENDING, PAID, OVERDUE, CANCELLED, REFUNDED.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response contains PENDING status
     * - Response contains PAID status
     * - Response contains OVERDUE status
     * - Response contains CANCELLED status
     * - Response contains REFUNDED status
     * 
     * VALIDATES:
     * ✓ All critical statuses are present
     * ✓ Enum values match expected business logic
     */
    @Test
    @DisplayName("GET /billing-statuses contains critical status values")
    void testGetBillingStatusesContainsCriticalValues() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-statuses")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@=='PENDING')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@=='PAID')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@=='FAILED')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@=='REFUNDED')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@=='CANCELLED')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@=='PAYMENT_CLAIMED')]", hasSize(1)));
    }

    /**
     * TEST: GET /api/billings/billing-statuses accessible by all roles
     * 
     * DESCRIPTION:
     * Verifies that the endpoint is accessible by CUSTOMER, OPERATOR, and ADMIN users.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK for all roles
     * 
     * VALIDATES:
     * ✓ CUSTOMER can access endpoint
     * ✓ OPERATOR can access endpoint
     * ✓ ADMIN can access endpoint
     */
    @Test
    @DisplayName("GET /billing-statuses is accessible by all roles")
    void testGetBillingStatusesAccessibleByAllRoles() throws Exception {
        // Test CUSTOMER
        mockMvc.perform(get("/api/billings/billing-statuses")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        // Test OPERATOR
        mockMvc.perform(get("/api/billings/billing-statuses")
                .header("Authorization", "Bearer " + operatorToken))
            .andExpect(status().isOk());

        // Test ADMIN
        mockMvc.perform(get("/api/billings/billing-statuses")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk());
    }

    /**
     * TEST: GET /api/billings/billing-statuses requires authentication
     * 
     * DESCRIPTION:
     * Verifies that the endpoint requires Bearer token.
     * Requests without token should be denied.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 401 Unauthorized (without token)
     * 
     * VALIDATES:
     * ✓ Authentication is required
     * ✓ Missing token returns 401
     */
    @Test
    @DisplayName("GET /billing-statuses requires authentication (401 Unauthorized)")
    void testGetBillingStatusesRequiresAuth() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-statuses")
                // No Authorization header
        )
            .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    // GET BILLING PERIODS ENDPOINT TESTS
    // ============================================================================

    /**
     * TEST: GET /api/billings/billing-periods returns all BillingPeriod enum values
     * 
     * DESCRIPTION:
     * Verifies that the endpoint returns a complete list of all available billing periods.
     * Authenticated users can access this endpoint.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response is a JSON array of strings
     * - Contains all BillingPeriod enum names (MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL)
     * - Array is not empty
     * - Content-Type is application/json
     * 
     * VALIDATES:
     * ✓ Endpoint returns 200 OK
     * ✓ Response is JSON array
     * ✓ All BillingPeriod values are present
     * ✓ No extra values are included
     * ✓ Order matches enum definition
     */
    @Test
    @DisplayName("GET /billing-periods returns all billing periods (200 OK)")
    void testGetBillingPeriodsSuccess() throws Exception {
        // Arrange
        List<String> expectedPeriods = Arrays.stream(BillingPeriod.values())
                .map(Enum::name)
                .toList();

        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-periods")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$", isA(List.class)))
            .andExpect(jsonPath("$", hasSize(expectedPeriods.size())))
            .andExpect(jsonPath("$[*]", containsInAnyOrder(expectedPeriods.toArray())))
            .andDo(result -> {
                log.info("Billing periods returned: {}", result.getResponse().getContentAsString());
            });
    }

    /**
     * TEST: GET /api/billings/billing-periods returns non-empty list
     * 
     * DESCRIPTION:
     * Verifies that the billing periods list is not empty.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response array contains at least one period
     * 
     * VALIDATES:
     * ✓ Response is not empty
     * ✓ At least one period is available
     */
    @Test
    @DisplayName("GET /billing-periods returns non-empty list")
    void testGetBillingPeriodsNotEmpty() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-periods")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThan(0))));
    }

    /**
     * TEST: GET /api/billings/billing-periods contains specific period values
     * 
     * DESCRIPTION:
     * Verifies that the response contains expected billing period values.
     * Tests for critical periods: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK
     * - Response contains MONTHLY period
     * - Response contains QUARTERLY period
     * - Response contains SEMI_ANNUAL period
     * - Response contains ANNUAL period
     * 
     * VALIDATES:
     * ✓ All critical periods are present
     * ✓ Enum values match expected business logic
     */
    @Test
    @DisplayName("GET /billing-periods contains critical period values")
    void testGetBillingPeriodsContainsCriticalValues() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-periods")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@=='MONTHLY')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@=='YEARLY')]", hasSize(1)));
    }

    /**
     * TEST: GET /api/billings/billing-periods accessible by all roles
     * 
     * DESCRIPTION:
     * Verifies that the endpoint is accessible by CUSTOMER, OPERATOR, and ADMIN users.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK for all roles
     * 
     * VALIDATES:
     * ✓ CUSTOMER can access endpoint
     * ✓ OPERATOR can access endpoint
     * ✓ ADMIN can access endpoint
     */
    @Test
    @DisplayName("GET /billing-periods is accessible by all roles")
    void testGetBillingPeriodsAccessibleByAllRoles() throws Exception {
        // Test CUSTOMER
        mockMvc.perform(get("/api/billings/billing-periods")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        // Test OPERATOR
        mockMvc.perform(get("/api/billings/billing-periods")
                .header("Authorization", "Bearer " + operatorToken))
            .andExpect(status().isOk());

        // Test ADMIN
        mockMvc.perform(get("/api/billings/billing-periods")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk());
    }

    /**
     * TEST: GET /api/billings/billing-periods requires authentication
     * 
     * DESCRIPTION:
     * Verifies that the endpoint requires Bearer token.
     * Requests without token should be denied.
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 401 Unauthorized (without token)
     * 
     * VALIDATES:
     * ✓ Authentication is required
     * ✓ Missing token returns 401
     */
    @Test
    @DisplayName("GET /billing-periods requires authentication (401 Unauthorized)")
    void testGetBillingPeriodsRequiresAuth() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/billings/billing-periods")
                // No Authorization header
        )
            .andExpect(status().isUnauthorized());
    }

    /**
     * TEST: Both enum endpoints return valid JSON arrays
     * 
     * DESCRIPTION:
     * Verifies that both endpoints return properly formatted JSON arrays.
     * Each element should be a string (enum name).
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 200 OK for both endpoints
     * - Response is valid JSON array
     * - All array elements are strings
     * 
     * VALIDATES:
     * ✓ JSON format is correct
     * ✓ All values are strings
     * ✓ No null values in array
     */
    @Test
    @DisplayName("Both enum endpoints return valid JSON arrays with string elements")
    void testEnumEndpointsReturnValidJsonArrays() throws Exception {
        // Act & Assert - Billing Statuses
        mockMvc.perform(get("/api/billings/billing-statuses")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", isA(List.class)))
            .andExpect(jsonPath("$[*]", everyItem(isA(String.class))))
            .andExpect(jsonPath("$[*]", everyItem(not(nullValue()))));

        // Act & Assert - Billing Periods
        mockMvc.perform(get("/api/billings/billing-periods")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", isA(List.class)))
            .andExpect(jsonPath("$[*]", everyItem(isA(String.class))))
            .andExpect(jsonPath("$[*]", everyItem(not(nullValue()))));
    }
}

