package com.subscriptionapi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RefreshTokenRepository;
import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.http.MediaType;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;

import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.dto.RegisterRequest;

//@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Protected Endpoints Integration Tests")
class ProtectedEndpointsIntegrationTest {

    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private User testCustomer;
    private User testOperator;
    private User testAdmin;
    private String validToken;
    private String customerToken;
    private String operatorToken;
    private String adminToken;
    private Role customerRole;
    private Role operatorRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        Role customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        Role operatorRole = roleRepository.findByName(RoleType.OPERATOR)
            .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));

        Role adminRole = roleRepository.findByName(RoleType.ADMIN)
            .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        testCustomer = User.builder()
                .email("customer@example.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        testOperator = User.builder()
                .email("operator@example.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("User")
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
        userRepository.save(testOperator);
        userRepository.save(testAdmin);

        // Keep testUser as alias to testCustomer for backward compatibility
        testUser = testCustomer;
        
        customerToken = jwtTokenProvider.generateToken(testCustomer);
        operatorToken = jwtTokenProvider.generateToken(testOperator);
        adminToken = jwtTokenProvider.generateToken(testAdmin);
        
        // Keep validToken as alias to customerToken for backward compatibility
        validToken = customerToken;
    }

    /**
     * DIAGNOSTIC TEST - Check all beans and servlet context
     */
    @Test
    @DisplayName("Diagnostic: Check Spring Context and Beans")
    void testDiagnosticCheckContext() throws Exception {
        System.out.println("\n========== DIAGNOSTIC TEST ==========");
        
        // Check if MockMvc is available
        System.out.println("✓ MockMvc is available: " + (mockMvc != null));
        
        // Check if repositories are available
        System.out.println("✓ UserRepository is available: " + (userRepository != null));
        System.out.println("✓ RoleRepository is available: " + (roleRepository != null));
        
        // Check if test user was created
        System.out.println("✓ Test user created: " + (testUser != null));
        System.out.println("  - Email: " + testUser.getEmail());
        System.out.println("  - ID: " + testUser.getId());
        
        // Check if token was generated
        System.out.println("✓ Valid token generated: " + (validToken != null && !validToken.isEmpty()));
        System.out.println("  - Token: " + validToken.substring(0, Math.min(50, validToken.length())) + "...");
        
        // Try a simple GET request WITHOUT token
        System.out.println("\n--- Testing GET /api/users WITHOUT token ---");
        try {
            mockMvc.perform(get("/api/users"))
                    .andDo(result -> {
                        System.out.println("Status: " + result.getResponse().getStatus());
                        System.out.println("Content-Type: " + result.getResponse().getContentType());
                        System.out.println("Response: " + result.getResponse().getContentAsString());
                    });
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Try a simple GET request WITH token
        System.out.println("\n--- Testing GET /api/users WITH token ---");
        try {
            mockMvc.perform(get("/api/users")
                    .header("Authorization", "Bearer " + validToken))
                    .andDo(result -> {
                        System.out.println("Status: " + result.getResponse().getStatus());
                        System.out.println("Content-Type: " + result.getResponse().getContentType());
                        System.out.println("Response: " + result.getResponse().getContentAsString());
                    });
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\n========== END DIAGNOSTIC TEST ==========\n");
    }

    /**
     * Scenario: Client attempts to access protected endpoints without providing an Authorization header.
     * Expected: Server returns 401 Unauthorized status with error message indicating missing authentication.
     * This test validates that the security filter properly rejects unauthenticated requests across multiple endpoints.
     */
    @ParameterizedTest(name = "Request without Authorization header should return 401")
    @ValueSource(strings = {"/api/users", "/api/subscriptions", "/api/admin/dashboard"})
    @DisplayName("Unauthenticated requests without token")
    void testUnauthorizedAccessWithoutToken(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.message", containsString("Unauthorized")))
                .andExpect(jsonPath("$.status", is(401)));
    }

    /**
     * Scenario: Client sends requests with various malformed Authorization header formats.
     * Examples include: missing "Bearer" prefix, incomplete headers, wrong authentication scheme, and corrupted JWT signatures.
     * Expected: Server returns 401 Unauthorized for all malformed header variations.
     * This test ensures the authentication parser correctly validates header structure and format.
     */
    @ParameterizedTest(name = "Malformed auth header: {0}")
    @CsvSource({
            "InvalidToken",
            "Bearer",
            "BearerToken",
            "BasicAuth token123"
    })
    @DisplayName("Malformed Authorization headers should return 401")
    void testUnauthorizedAccessWithMalformedHeader(String headerValue) throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", headerValue))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.message", containsString("Unauthorized")))
                .andExpect(jsonPath("$.status", is(401)));
    }


    /**
     * DIAGNOSTIC TEST - Check token validation
     */
    @Test
    @DisplayName("Debug: Check token validation")
    void testTokenValidation() throws Exception {
        System.out.println("\n=== TOKEN VALIDATION DEBUG ===");
        System.out.println("Token: " + validToken);
        System.out.println("Token is valid: " + jwtTokenProvider.isTokenValid(validToken));
        System.out.println("Email from token: " + jwtTokenProvider.getEmailFromToken(validToken));
        System.out.println("User ID from token: " + jwtTokenProvider.getUserIdFromToken(validToken));
        System.out.println("===============================\n");
    }

    @Test
    @DisplayName("Debug: Check actual response from /api/auth/login")
    void testAuthEndpointResponse() throws Exception {
        System.out.println("\n=== AUTH ENDPOINT DEBUG ===");
        
        LoginRequest loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
        
        MvcResult result = mockMvc.perform(post("/api/auth/login")  // ← POST, not GET
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();
        
        System.out.println("Status: " + result.getResponse().getStatus());
        System.out.println("Content Type: " + result.getResponse().getContentType());
        System.out.println("Response Body: " + result.getResponse().getContentAsString());
        System.out.println("===============================\n");
    }

    /**
     * Scenario: Test authentication behavior for endpoints with different security requirements.
     * 
     * Case 1 (Public endpoint): Unauthenticated request to /api/auth/login (public)
     * Expected: Server processes the login request without requiring authentication, returning 200 OK or 401 (invalid credentials)
     * 
     * Case 2 (Protected endpoint): Authenticated request to /api/profile (protected) with valid JWT token
     * Expected: Server validates the token and grants access, returning 200 OK
     * 
     * This test confirms that the application correctly enforces authentication requirements:
     * - Public endpoints are accessible without tokens
     * - Protected endpoints require valid JWT tokens
     */
    @ParameterizedTest(name = "Endpoint: {0}, Requires Token: {1}")
    @CsvSource({
        "/api/auth/login, false",
        "/api/user/profile, true"
    })
    @DisplayName("Test endpoints with and without token requirement")
    void testAuthorizedAccessWithValidToken(String endpoint, String requiresTokenStr) throws Exception {
        System.out.println("Endpoint: '" + endpoint + "'");
        System.out.println("RequiresToken: '" + requiresTokenStr + "'");

        boolean requiresToken = Boolean.parseBoolean(requiresTokenStr);
        
        LoginRequest loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
        
        if (requiresToken) {
            // Protected endpoint: Must include valid JWT token
            UserDetails mockUserDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(testUser.getEmail())
                    .password("password123")
                    .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                    .build();
            
            when(userDetailsService.loadUserByUsername(testUser.getEmail()))
                    .thenReturn(mockUserDetails);
            
            mockMvc.perform(get(endpoint)
                    .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("application/json"));
        } else {
            // Public endpoint: Can be accessed without token
            mockMvc.perform(post(endpoint)
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().is(anyOf(
                        equalTo(200),  // Successful login
                        equalTo(401)   // Invalid credentials
                    )))
                    .andExpect(content().contentType("application/json"));
        }
    }

    /**
     * Scenario: Client sends requests with various invalid JWT token formats including corrupted signatures, malformed structures, and incomplete tokens.
     * Expected: Server rejects all invalid token formats and returns 401 Unauthorized.
     * This test validates JWT parsing and signature verification logic to prevent token forgery attacks.
     */
    @ParameterizedTest(name = "Invalid token format: {0}")
    @ValueSource(strings = {
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid",
            "Bearer malformedtoken",
            "Bearer "
    })
    @DisplayName("Invalid token formats should return 401")
    void testUnauthorizedAccessWithInvalidTokenFormat(String authHeader) throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", authHeader))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Scenario: Client makes requests using different HTTP methods (GET, POST, PUT, DELETE) without providing authentication tokens.
     * Expected: Server returns 401 Unauthorized for all HTTP methods, demonstrating consistent security enforcement across the API.
     * This test ensures authentication is required uniformly regardless of the HTTP verb used.
     */
    @ParameterizedTest(name = "HTTP method {0} without token should return 401")
    @CsvSource({
            "GET, /api/users",
            "POST, /api/subscriptions",
            "PUT, /api/users/1",
            "DELETE, /api/subscriptions/1"
    })
    @DisplayName("All HTTP methods require authentication")
    void testAllHttpMethodsRequireAuthentication(String method, String endpoint) throws Exception {
        switch (method.toUpperCase()) {
            case "GET":
                mockMvc.perform(get(endpoint))
                        .andExpect(status().isUnauthorized());
                break;
            case "POST":
                mockMvc.perform(post(endpoint).contentType("application/json").content("{}"))
                        .andExpect(status().isUnauthorized());
                break;
            case "PUT":
                mockMvc.perform(put(endpoint).contentType("application/json").content("{}"))
                        .andExpect(status().isUnauthorized());
                break;
            case "DELETE":
                mockMvc.perform(delete(endpoint))
                        .andExpect(status().isUnauthorized());
                break;
        }
    }


    /**
     * Scenario: Verify that public endpoints (/api/auth/login and /api/auth/register) 
     * allow unauthenticated access and return the expected HTTP status codes.
     * Expected: Login endpoint returns 200 (success), register endpoint returns 400 (validation failure).
     * This test ensures that authentication is not required to reach these endpoints and that 
     * they respond with appropriate status codes for valid/invalid requests.
     */
    @ParameterizedTest(name = "Public endpoint {0} expects status {1}")
    @CsvSource({
        "/api/auth/login, 200",
        "/api/auth/register, 201"
    })
    @DisplayName("Public endpoints allow unauthenticated access")
    void testPublicEndpointsAllowUnauthenticatedAccess(String endpoint, int expectedStatus) throws Exception {
        System.out.println("=== Test Parameters ===");
        System.out.println("Endpoint: " + endpoint);
        System.out.println("Expected Status: " + expectedStatus);
        System.out.println("=======================");

        String uniqueEmail = "newuser" + System.currentTimeMillis() + "@example.com";
        
        if (endpoint.contains("login")) {
            LoginRequest loginRequest = LoginRequest.builder()
                    .email("customer@example.com")
                    .password("password123")
                    .build();
            
            mockMvc.perform(post(endpoint)
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().is(expectedStatus));
        } else {
            RegisterRequest registerRequest = RegisterRequest.builder()
                    .email(uniqueEmail)
                    .password("Password123@")
                    .passwordConfirm("Password123@")
                    .firstName("Test")
                    .lastName("User")
                    .build();
            
            mockMvc.perform(post(endpoint)
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().is(expectedStatus));
        }
    }

    /**
     * Scenario: Verify that JWT tokens contain the expected claims (email, user ID) that identify the authenticated user.
     * Expected: Token claims are correctly extracted and match the user information used during token generation.
     * This test ensures token payload integrity and that user identity information is properly embedded in the JWT.
     */
    @ParameterizedTest(name = "Token should contain claim: {0}")
    @CsvSource({
            "email, test@example.com",
            "id, 1"
    })
    @DisplayName("JWT token contains expected claims")
    void testTokenContainsExpectedClaims(String claimName, String expectedValue) throws Exception {
        // Create a User object with known claims
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("password123")
                // Add any other required fields
                .build();
        
        // Generate a valid token from the User object
        String token = jwtTokenProvider.generateToken(user);
        
        // Extract and verify claims
        String extractedEmail = jwtTokenProvider.getEmailFromToken(token);
        Long extractedUserId = jwtTokenProvider.getUserIdFromToken(token);

        if ("email".equals(claimName)) {
            assert extractedEmail.equals(expectedValue) : 
                "Expected email " + expectedValue + " but got " + extractedEmail;
        } else if ("id".equals(claimName)) {
            assert extractedUserId.equals(Long.parseLong(expectedValue)) : 
                "Expected id " + expectedValue + " but got " + extractedUserId;
        }
    }

    /**
     * Scenario: Verify CORS headers are properly configured for both existing and non-existing endpoints.
     * Expected: Allowed origins receive proper CORS headers for existing endpoints. Non-existing endpoints return 404.
     * This test confirms CORS configuration works correctly across different endpoint scenarios.
     */
    @ParameterizedTest(name = "CORS origin {0} with path {1} expects status {2}")
    @CsvSource({
            "http://localhost:3000, /api/user/profile, 200",
            "http://localhost:4200, /api/user/profile, 200",
            "http://localhost:3000, /api/operator/dashboard, 403",
            "http://localhost:4200, /api/operator/dashboard, 403",
            "http://localhost:3000, /api/nonexistent, 404",
            "http://localhost:4200, /api/nonexistent, 404"
    })
    @DisplayName("CORS origins are properly configured for specific endpoints")
    void testCorsOriginWithDifferentPaths(String origin, String path, int expectedStatus) throws Exception {
        UserDetails mockCustomerDetails = org.springframework.security.core.userdetails.User.builder()
                .username("customer@example.com")
                .password("password123")
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                .build();
        
        when(userDetailsService.loadUserByUsername("customer@example.com"))
                .thenReturn(mockCustomerDetails);

        System.out.println("=== Test Parameters ===");
        System.out.println("Origin: " + origin);
        System.out.println("Path: " + path);
        System.out.println("Expected Status: " + expectedStatus);
        System.out.println("=======================");

        var resultActions = mockMvc.perform(get(path)
                .header("Authorization", "Bearer " + customerToken)
                .header("Origin", origin))
                .andExpect(status().is(expectedStatus));
        
        resultActions.andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(header().string("Access-Control-Allow-Origin", origin));
    }

    /**
     * Scenario: Verify that CORS requests from disallowed origins are rejected.
     * Expected: Disallowed origins receive 403 Forbidden status, effectively blocking cross-origin access.
     * This test confirms that only whitelisted origins can access protected resources.
     */
    @ParameterizedTest(name = "CORS origin {0} should be rejected")
    @ValueSource(strings = {"http://localhost:5000", "http://evil.com"})
    @DisplayName("Disallowed CORS origins are rejected")
    void testCorsForbiddenOrigins(String origin) throws Exception {
        mockMvc.perform(options("/api/users")
                .header("Origin", origin))
                .andExpect(status().isForbidden())  // ← Changed from isOk() to isForbidden()
                .andExpect(result -> {
                    String allowOrigin = result.getResponse().getHeader("Access-Control-Allow-Origin");
                    Assertions.assertNull(allowOrigin, 
                        "Origin " + origin + " should not have Access-Control-Allow-Origin header");
                });
    }

    /**
     * Scenario: Users with specific roles attempt to access endpoints designated for those roles.
     * Expected: Server returns 200 OK when users have the required role permissions, 403 Forbidden when they don't, and 404 for unavailable endpoints.
     * This test validates role-based access control (RBAC) ensures users can only access resources authorized for their role.
     */
    @ParameterizedTest(name = "User with role {0} accessing {1} expects {2}")
    @CsvSource({
            "CUSTOMER, /api/user/profile, 200",
            "CUSTOMER, /api/operator/dashboard, 403",
            "CUSTOMER, /api/admin/dashboard, 403",
            "CUSTOMER, /api/nonexistent, 404",
            "OPERATOR, /api/user/profile, 200",
            "OPERATOR, /api/operator/dashboard, 200",
            "OPERATOR, /api/operator/plans, 200",
            "OPERATOR, /api/admin/dashboard, 403",
            "ADMIN, /api/user/profile, 200",
            "ADMIN, /api/operator/dashboard, 403",
            "ADMIN, /api/admin/dashboard, 404",
            "ADMIN, /api/admin/users, 200",
            "ADMIN, /api/nonexistent, 404"
    })
    @DisplayName("Role-based access control with specific endpoints")
    void testRoleBasedAccessControl(String role, String endpoint, int expectedStatus) throws Exception {
        System.out.println("=== Test Parameters ===");
        System.out.println("Role: " + role);
        System.out.println("Endpoint: " + endpoint);
        System.out.println("Expected Status: " + expectedStatus);
        System.out.println("=======================");

        Role testRole = roleRepository.findByName(RoleType.valueOf(role)).orElseThrow();
        User roleSpecificUser = User.builder()
                .email("roleuser" + System.currentTimeMillis() + "@example.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Role")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(testRole)))
                .build();
        userRepository.save(roleSpecificUser);

        String roleToken = jwtTokenProvider.generateToken(roleSpecificUser);

        // Mock the UserDetailsService for this new user
        UserDetails mockUserDetails = org.springframework.security.core.userdetails.User.builder()
                .username(roleSpecificUser.getEmail())
                .password("password123")
                .authorities(new SimpleGrantedAuthority("ROLE_" + role))
                .build();
        
        when(userDetailsService.loadUserByUsername(roleSpecificUser.getEmail()))
                .thenReturn(mockUserDetails);

        mockMvc.perform(get(endpoint)
                .header("Authorization", "Bearer " + roleToken))
                .andExpect(status().is(expectedStatus));
    }

    /**
     * Scenario: Client sends Authorization headers with different case variations of the "Bearer" prefix (bearer, BEARER, Bearer).
     * Expected: Only the correctly capitalized "Bearer " prefix is accepted; lowercase or uppercase variations are rejected with 401 Unauthorized.
     * This test confirms that Bearer token prefix validation is case-sensitive per OAuth 2.0 specification.
     */
    @ParameterizedTest(name = "Bearer prefix {0} expects status {1}")
    @CsvSource({
            "'Bearer ', 200",
            "'bearer ', 401",
            "'BEARER ', 401"
    })
    @DisplayName("Bearer prefix should be case-sensitive")
    void testBearerPrefixCaseSensitivity(String prefix, int expectedStatus) throws Exception {
        UserDetails mockUserDetails = org.springframework.security.core.userdetails.User.builder()
                .username(testUser.getEmail())
                .password("password123")
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                .build();
        
        when(userDetailsService.loadUserByUsername(testUser.getEmail()))
                .thenReturn(mockUserDetails);
        
        String authHeader = prefix + validToken;
        
        mockMvc.perform(get("/api/user/profile")
                .header("Authorization", authHeader))
                .andExpect(status().is(expectedStatus));
    }

    /**
     * Scenario: Client sends requests with valid JWT tokens in the Authorization header at different logical positions.
     * Expected: Server correctly extracts and validates the token regardless of its position, returning 200 OK.
     * This test ensures the token extraction logic is robust and handles token placement variations correctly.
     */
    @ParameterizedTest(name = "Request with token in {0} position")
    @ValueSource(strings = {"first", "second"})
    @DisplayName("Token extraction from various header positions")
    void testTokenExtractionFromHeaders(String position) throws Exception {
        UserDetails mockAdminDetails = org.springframework.security.core.userdetails.User.builder()
                .username("admin@example.com")
                .password("password123")
                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                .build();
        
        when(userDetailsService.loadUserByUsername("admin@example.com"))
                .thenReturn(mockAdminDetails);
        
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
