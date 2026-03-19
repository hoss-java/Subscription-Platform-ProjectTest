package com.subscriptionapi.controller;

import com.subscriptionapi.dto.LoginRequest;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
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

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.not;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthController Login Integration Tests")
class AuthControllerLoginIntegrationTest {

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

    @BeforeEach
    void setUp() {
        // Create CUSTOMER role
        Role customerRole = new Role();
        customerRole.setName(RoleType.CUSTOMER);
        customerRole.setDescription("Customer role");
        roleRepository.save(customerRole);

        // Create test users with encoded passwords (matching UserService.loginUser() logic)
        createTestUser("user1@example.com", "password123", "John", "Doe", customerRole);
        createTestUser("user2@example.com", "securepass456", "Jane", "Smith", customerRole);
        createTestUser("admin@example.com", "adminpass789", "Admin", "User", customerRole);
    }

    private void createTestUser(String email, String password, String firstName, String lastName, Role role) {
        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))  // Encode password like UserService does
            .firstName(firstName)
            .lastName(lastName)
            .isActive(true)
            .roles(new HashSet<>(Set.of(role)))
            .build();
        userRepository.save(user);
    }

    @ParameterizedTest(name = "Login with email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "user1@example.com, password123, 200",
        "user2@example.com, securepass456, 200",
        "admin@example.com, adminpass789, 200"
    })
    @DisplayName("Should successfully login with valid credentials")
    void testLoginWithValidCredentials(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus))
            .andExpect(jsonPath("$.message").value("Login successful"))
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.refreshToken").exists())
            .andExpect(jsonPath("$.userDetails.email").value(email))
            .andExpect(jsonPath("$.userDetails.firstName").exists())
            .andExpect(jsonPath("$.userDetails.lastName").exists())
            .andExpect(jsonPath("$.userDetails.isActive").value(true));
    }

    @ParameterizedTest(name = "Login with invalid email: {0}")
    @CsvSource({
        "nonexistent@example.com",
        "invalid-email-format",
        "user@"
    })
    @DisplayName("Should fail login with invalid email")
    void testLoginWithInvalidEmail(String email) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is4xxClientError());
    }

    @ParameterizedTest(name = "Login with wrong password for {0}, expects status {1}")
    @CsvSource({
        "user1@example.com, wrongpassword, 401",
        "user2@example.com, incorrectpass, 401",
        "admin@example.com, wrongadminpass, 401"
    })
    @DisplayName("Should fail login with incorrect password")
    void testLoginWithWrongPassword(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }

    @ParameterizedTest(name = "Login with empty fields - email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "\"\", password123, 400",
        "user1@example.com, \"\", 400",
        "\"\", \"\", 400"
    })
    @DisplayName("Should fail login with empty credentials")
    void testLoginWithEmptyCredentials(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }

    @ParameterizedTest(name = "Login with null fields - email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "null, password123, 400",
        "user1@example.com, null, 400"
    })
    @DisplayName("Should fail login with null credentials")
    void testLoginWithNullCredentials(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("null".equals(email) ? null : email);
        loginRequest.setPassword("null".equals(password) ? null : password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }

    @Test
    @DisplayName("Should return valid JWT token on successful login")
    void testLoginReturnsValidToken() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user1@example.com");
        loginRequest.setPassword("password123");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").isNotEmpty())
            .andExpect(jsonPath("$.token").value(not(emptyString())))
            .andExpect(jsonPath("$.refreshToken").value(not(emptyString())));
    }

    @ParameterizedTest(name = "Login case sensitivity test - email: {0}, password: {1}, expects status {2}")
    @CsvSource({
        "USER1@EXAMPLE.COM, password123, 401",
        "user1@example.com, PASSWORD123, 401",
        "User1@Example.Com, Password123, 401"
    })
    @DisplayName("Should fail login with incorrect case in credentials")
    void testLoginCaseSensitivity(String email, String password, int expectedStatus) throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is(expectedStatus));
    }
}
