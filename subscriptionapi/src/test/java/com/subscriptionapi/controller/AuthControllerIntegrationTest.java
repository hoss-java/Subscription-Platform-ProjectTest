package com.subscriptionapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    private RegisterRequest registerRequest;
    private Role customerRole;
    
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();
        
        customerRole = Role.builder()
                .name(RoleType.CUSTOMER)
                .description("Customer role")
                .build();
        roleRepository.save(customerRole);
        
        registerRequest = RegisterRequest.builder()
                .email("newuser@example.com")
                .password("TestPassword123!")
                .passwordConfirm("TestPassword123!")
                .firstName("John")
                .lastName("Doe")
                .build();
    }
    
    @Test
    void testRegisterUserSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.message").value("User registered successfully"))
            .andExpect(jsonPath("$.token").value(nullValue()))
            .andExpect(jsonPath("$.userDetails.email").value("newuser@example.com"))
            .andExpect(jsonPath("$.userDetails.firstName").value("John"))
            .andExpect(jsonPath("$.userDetails.lastName").value("Doe"))
            .andExpect(jsonPath("$.userDetails.isActive").value(true));
    }

    
    @Test
    void testRegisterUserWithDuplicateEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testRegisterUserWithPasswordMismatch() throws Exception {
        registerRequest.setPasswordConfirm("DifferentPassword123!");
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testRegisterUserWithInvalidEmail() throws Exception {
        registerRequest.setEmail("invalid-email");
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testRegisterUserWithWeakPassword() throws Exception {
        registerRequest.setPassword("weak");
        registerRequest.setPasswordConfirm("weak");
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testRegisterUserWithMissingFields() throws Exception {
        RegisterRequest incompleteRequest = RegisterRequest.builder()
                .email("test@example.com")
                .build();
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(incompleteRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testRegisterUserAssignsCustomerRole() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());
        
        var user = userRepository.findByEmail("newuser@example.com");
        assertTrue(user.isPresent());
        assertTrue(user.get().getRoles().stream()
                .anyMatch(role -> role.getName() == RoleType.CUSTOMER));
    }
}
