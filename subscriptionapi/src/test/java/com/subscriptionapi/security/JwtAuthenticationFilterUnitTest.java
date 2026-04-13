package com.subscriptionapi.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.subscriptionapi.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterUnitTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private UserDetails userDetails;

    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ✅ Test 1: Valid token should populate security context
    @Test
    void testValidTokenPopulatesSecurityContext() throws Exception {
        String token = "valid.jwt.token";
        String email = "user@test.com";
        
        when(request.getRequestURI()).thenReturn("/api/protected/resource");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtTokenProvider.isTokenValid(token)).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken(token)).thenReturn(email);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(userDetails.getAuthorities()).thenReturn(new ArrayList<>());
        
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        // ✅ Compare the UserDetails object, not the email string
        assertEquals(userDetails, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        verify(filterChain).doFilter(request, response);
    }

    // ✅ Test 2: Invalid token should NOT populate security context
    @Test
    void testInvalidTokenDoesNotPopulateSecurityContext() throws Exception {
        String token = "invalid.jwt.token";
        
        when(request.getRequestURI()).thenReturn("/api/protected/resource");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtTokenProvider.isTokenValid(token)).thenReturn(false);
        
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    // ✅ Test 3: Missing or malformed Authorization header
    @ParameterizedTest
    @ValueSource(strings = {"", "InvalidHeader", "Basic xyz", "NoBearer"})
    void testMissingOrInvalidAuthHeader(String authHeader) throws Exception {
        when(request.getRequestURI()).thenReturn("/api/protected/resource");
        when(request.getHeader("Authorization")).thenReturn(authHeader.isEmpty() ? null : authHeader);
        
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    // ✅ Test 4: Token extraction with different Bearer formats
    @ParameterizedTest
    @ValueSource(strings = {"Bearer valid.jwt.token", "Bearer expired.jwt.token", "Bearer invalid.jwt.token"})
    void testTokenExtraction(String authHeader) throws Exception {
        when(request.getRequestURI()).thenReturn("/api/protected/resource");
        when(request.getHeader("Authorization")).thenReturn(authHeader);
        
        String token = authHeader.substring(7);
        
        if (authHeader.contains("valid")) {
            when(jwtTokenProvider.isTokenValid(token)).thenReturn(true);
            when(jwtTokenProvider.getEmailFromToken(token)).thenReturn("user@test.com");
            when(userDetailsService.loadUserByUsername("user@test.com")).thenReturn(userDetails);
            when(userDetails.getAuthorities()).thenReturn(new ArrayList<>());
        } else {
            when(jwtTokenProvider.isTokenValid(token)).thenReturn(false);
        }
        
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        verify(filterChain).doFilter(request, response);
    }

    // ✅ Test 5: Public endpoints bypass authentication
    @ParameterizedTest
    @ValueSource(strings = {"/api/auth/login", "/api/auth/register", "/api/auth/refresh"})
    void testPublicEndpointBypassesAuthentication(String endpoint) throws Exception {
        when(request.getRequestURI()).thenReturn(endpoint);
        
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verify(jwtTokenProvider, never()).isTokenValid(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    // ✅ Test 6: UserDetailsService throws UsernameNotFoundException
    @Test
    void testUserDetailsServiceThrowsException() throws Exception {
        String token = "valid.jwt.token";
        String email = "nonexistent@test.com";
        
        when(request.getRequestURI()).thenReturn("/api/protected/resource");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtTokenProvider.isTokenValid(token)).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken(token)).thenReturn(email);
        when(userDetailsService.loadUserByUsername(email))
            .thenThrow(new UsernameNotFoundException("User not found"));
        
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    // ✅ Test 7: Null token (no Authorization header)
    @Test
    void testNullTokenDoesNotPopulateSecurityContext() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/protected/resource");
        when(request.getHeader("Authorization")).thenReturn(null);
        
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verify(jwtTokenProvider, never()).isTokenValid(anyString());
    }
}
