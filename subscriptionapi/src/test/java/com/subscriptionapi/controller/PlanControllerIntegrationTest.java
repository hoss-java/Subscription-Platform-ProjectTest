package com.subscriptionapi.controller;

import com.subscriptionapi.dto.PlanCreateRequest;
import com.subscriptionapi.dto.PlanResponseDTO;
import com.subscriptionapi.dto.PlanUpdateRequest;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.repository.PlanRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * INTEGRATION TEST SUITE: PlanController Security Tests
 * 
 * PURPOSE:
 * Tests role-based access control for Plan endpoints.
 * Verifies that only OPERATOR users can create, update, and delete plans.
 * Tests that non-OPERATOR users (CUSTOMER, ADMIN) are denied access.
 * 
 * TEST ENVIRONMENT:
 * - Uses Spring Boot test context with full application startup
 * - Runs against test database (H2 in-memory)
 * - Each test is transactional and rolled back after execution
 * - Uses MockMvc to simulate HTTP requests without starting a server
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("PlanController Security Integration Tests")
class PlanControllerIntegrationTest {

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testCustomer;
    private User testOperator1;
    private User testOperator2;
    private User testAdmin;
    
    private String customerToken;
    private String operatorToken1;
    private String operatorToken2;
    private String adminToken;
    
    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;
    
    private Plan testPlanOperator1;

    /**
     * SETUP METHOD: Executed before each test
     * 
     * PURPOSE:
     * Initializes test database with users of different roles and generates JWT tokens.
     * Creates test plans for ownership validation tests.
     * 
     * SETUP STEPS:
     * 1. Create three roles: CUSTOMER, OPERATOR, ADMIN
     * 2. Create four test users (one for each role, plus extra operator for ownership tests)
     * 3. Generate JWT tokens for each user
     * 4. Create test plan owned by operator1
     */
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        planRepository.deleteAll();

        // Load roles
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        operatorRole = roleRepository.findByName(RoleType.OPERATOR)
            .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));

        adminRole = roleRepository.findByName(RoleType.ADMIN)
            .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        // Create test users
        testCustomer = User.builder()
                .email("customer@example.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        testOperator1 = User.builder()
                .email("operator1@example.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();

        testOperator2 = User.builder()
                .email("operator2@example.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("Two")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();

        testAdmin = User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Admin")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(adminRole)))
                .build();

        userRepository.save(testCustomer);
        userRepository.save(testOperator1);
        userRepository.save(testOperator2);
        userRepository.save(testAdmin);

        // Generate tokens
        customerToken = jwtTokenProvider.generateToken(testCustomer);
        operatorToken1 = jwtTokenProvider.generateToken(testOperator1);
        operatorToken2 = jwtTokenProvider.generateToken(testOperator2);
        adminToken = jwtTokenProvider.generateToken(testAdmin);

        // Create test plan owned by operator1
        testPlanOperator1 = Plan.builder()
                .user(testOperator1)
                .name("Test Plan")
                .description("Test Description")
                .serviceType(ServiceType.INTERNET)
                .basePrice(new BigDecimal("29.99"))
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("[\"feature1\", \"feature2\"]")
                .status(PlanStatus.ACTIVE)
                .build();
        planRepository.save(testPlanOperator1);
    }

    /**
     * TEST: Non-OPERATOR users cannot create plans
     * 
     * DESCRIPTION:
     * Verifies that CUSTOMER and ADMIN users are denied access to POST /api/plans endpoint.
     * Only OPERATOR role should be able to create plans.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. CUSTOMER user with valid token
     * 2. ADMIN user with valid token
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     * - Response indicates access denied
     * 
     * VALIDATES:
     * ✓ @PreAuthorize("hasRole('OPERATOR')") blocks non-OPERATOR users
     * ✓ CUSTOMER cannot create plans
     * ✓ ADMIN cannot create plans
     */
    @ParameterizedTest(name = "Role {0} cannot create plan, expects 403")
    @CsvSource({
        "CUSTOMER,customerToken",
        "ADMIN,adminToken"
    })
    @DisplayName("Non-OPERATOR users cannot create plans (403 Forbidden)")
    void testCreatePlanDeniedForNonOperator(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);
        PlanCreateRequest planCreateRequest = PlanCreateRequest.builder()
                .name("New Plan")
                .description("New Plan Description")
                .serviceType(ServiceType.INTERNET)
                .basePrice(new BigDecimal("49.99"))
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("[\"feature1\"]")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/plans")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(planCreateRequest)))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: Non-OPERATOR users cannot update plans
     * 
     * DESCRIPTION:
     * Verifies that CUSTOMER and ADMIN users are denied access to PUT /api/plans/{id} endpoint.
     * Only OPERATOR role should be able to update plans.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. CUSTOMER user with valid token
     * 2. ADMIN user with valid token
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     * - Response indicates access denied
     * 
     * VALIDATES:
     * ✓ @PreAuthorize("hasRole('OPERATOR')") blocks non-OPERATOR users
     * ✓ CUSTOMER cannot update plans
     * ✓ ADMIN cannot update plans
     */
    @ParameterizedTest(name = "Role {0} cannot update plan, expects 403")
    @CsvSource({
        "CUSTOMER,customerToken",
        "ADMIN,adminToken"
    })
    @DisplayName("Non-OPERATOR users cannot update plans (403 Forbidden)")
    void testUpdatePlanDeniedForNonOperator(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);
        PlanUpdateRequest planUpdateRequest = PlanUpdateRequest.builder()
                .name("Updated Plan")
                .description("Updated Description")
                .build();

        // Act & Assert
        mockMvc.perform(put("/api/plans/" + testPlanOperator1.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(planUpdateRequest)))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: Non-OPERATOR users cannot delete plans
     * 
     * DESCRIPTION:
     * Verifies that CUSTOMER and ADMIN users are denied access to DELETE /api/plans/{id} endpoint.
     * Only OPERATOR role should be able to delete plans.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. CUSTOMER user with valid token
     * 2. ADMIN user with valid token
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     * - Response indicates access denied
     * 
     * VALIDATES:
     * ✓ @PreAuthorize("hasRole('OPERATOR')") blocks non-OPERATOR users
     * ✓ CUSTOMER cannot delete plans
     * ✓ ADMIN cannot delete plans
     */
    @ParameterizedTest(name = "Role {0} cannot delete plan, expects 403")
    @CsvSource({
        "CUSTOMER,customerToken",
        "ADMIN,adminToken"
    })
    @DisplayName("Non-OPERATOR users cannot delete plans (403 Forbidden)")
    void testDeletePlanDeniedForNonOperator(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);

        // Act & Assert
        mockMvc.perform(delete("/api/plans/" + testPlanOperator1.getId())
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    /**
     * TEST: Non-OPERATOR users cannot access /my-plans endpoint
     * 
     * DESCRIPTION:
     * Verifies that CUSTOMER and ADMIN users are denied access to GET /api/plans/my-plans endpoint.
     * Only OPERATOR role should be able to access their own plans.
     * 
     * TEST SCENARIOS (Parameterized):
     * 1. CUSTOMER user with valid token
     * 2. ADMIN user with valid token
     * 
     * EXPECTED BEHAVIOR:
     * - HTTP Status: 403 Forbidden
     * - Response indicates access denied
     * 
     * VALIDATES:
     * ✓ @PreAuthorize("hasRole('OPERATOR') && isAuthenticated()") blocks non-OPERATOR users
     * ✓ CUSTOMER cannot access /my-plans
     * ✓ ADMIN cannot access /my-plans
     */
    @ParameterizedTest(name = "Role {0} cannot access /my-plans, expects 403")
    @CsvSource({
        "CUSTOMER,customerToken",
        "ADMIN,adminToken"
    })
    @DisplayName("Non-OPERATOR users cannot access /my-plans (403 Forbidden)")
    void testMyPlansAccessDeniedForNonOperator(String role, String tokenField) throws Exception {
        // Arrange
        String token = getTokenByField(tokenField);

        // Act & Assert
        mockMvc.perform(get("/api/plans/my-plans")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
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
            case "operatorToken1" -> operatorToken1;
            case "operatorToken2" -> operatorToken2;
            case "adminToken" -> adminToken;
            default -> throw new IllegalArgumentException("Unknown token field: " + tokenField);
        };
    }
}
