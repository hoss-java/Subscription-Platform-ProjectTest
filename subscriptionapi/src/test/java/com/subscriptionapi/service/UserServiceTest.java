package com.subscriptionapi.service;

import com.subscriptionapi.dto.RegisterRequest;
import com.subscriptionapi.dto.AuthResponse;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.util.PasswordValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private RoleRepository roleRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private PasswordValidator passwordValidator;
    
    @InjectMocks
    private UserService userService;
    
    private RegisterRequest registerRequest;
    private Role customerRole;
    
    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("TestPassword123!")
                .passwordConfirm("TestPassword123!")
                .firstName("John")
                .lastName("Doe")
                .build();
        
        customerRole = Role.builder()
                .id(1L)
                .name(RoleType.CUSTOMER)
                .description("Customer role")
                .build();
    }
    
    @Test
    void testRegisterUserSuccess() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordValidator.isValidPassword("TestPassword123!")).thenReturn(true);
        when(passwordEncoder.encode("TestPassword123!")).thenReturn("hashedPassword");
        when(roleRepository.findByName(RoleType.CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        
        AuthResponse response = userService.registerUser(registerRequest);
        
        assertNotNull(response);
        assertEquals("User registered successfully", response.getMessage());
        assertNull(response.getToken());
        assertEquals("test@example.com", response.getUserDetails().getEmail());
        assertEquals("John", response.getUserDetails().getFirstName());
        verify(userRepository, times(1)).save(any(User.class));
    }
    
    @Test
    void testRegisterUserEmailAlreadyExists() {
        User existingUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("hashedPassword")
                .firstName("Jane")
                .lastName("Doe")
                .build();
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        
        assertThrows(RuntimeException.class, () -> userService.registerUser(registerRequest),
                "Email already exists");
    }
    
    @Test
    void testRegisterUserPasswordsDoNotMatch() {
        registerRequest.setPasswordConfirm("DifferentPassword123!");
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> userService.registerUser(registerRequest),
                "Passwords do not match");
    }
    
    @Test
    void testRegisterUserWeakPassword() {
        registerRequest.setPassword("weak");
        registerRequest.setPasswordConfirm("weak");
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordValidator.isValidPassword("weak")).thenReturn(false);
        
        assertThrows(RuntimeException.class, () -> userService.registerUser(registerRequest),
                "Password does not meet strength requirements");
    }
    
    @Test
    void testRegisterUserCustomerRoleNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordValidator.isValidPassword("TestPassword123!")).thenReturn(true);
        when(passwordEncoder.encode("TestPassword123!")).thenReturn("hashedPassword");
        when(roleRepository.findByName(RoleType.CUSTOMER)).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> userService.registerUser(registerRequest),
                "Default CUSTOMER role not found");
    }
}
