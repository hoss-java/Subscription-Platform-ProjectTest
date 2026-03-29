package com.subscriptionapi.security;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.exception.JwtAuthenticationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

import java.util.List;
import java.util.Arrays;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTHORIZATION_HEADER = "Authorization";

    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/forgot-password"
    );

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, 
                                   UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        
        System.out.println("\n=== JwtAuthenticationFilter START ===");
        System.out.println("Request Method: " + method);
        System.out.println("Request Path: " + requestPath);
        System.out.println("Request Path Length: " + requestPath.length());
        System.out.println("PUBLIC_ENDPOINTS: " + PUBLIC_ENDPOINTS);
        
        boolean isPublic = isPublicEndpoint(requestPath);
        System.out.println("Is Public Endpoint: " + isPublic);
        
        if (isPublic) {
            System.out.println("✓ Public endpoint - skipping JWT validation");
            System.out.println("=== JwtAuthenticationFilter END (public) ===\n");
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("✗ Protected endpoint - checking JWT token");
        
        try {
            String token = extractTokenFromRequest(request);
            System.out.println("Token extracted: " + (token != null ? "YES" : "NO"));
            
            if (token != null) {
                System.out.println("Token value: " + token.substring(0, Math.min(20, token.length())) + "...");
                boolean isValid = jwtTokenProvider.isTokenValid(token);
                System.out.println("Token valid: " + isValid);
                
                if (isValid) {
                    String email = jwtTokenProvider.getEmailFromToken(token);
                    System.out.println("Email from token: " + email);
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    System.out.println("User details loaded: " + userDetails.getUsername());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("✓ User authenticated: " + email);
                }
            } else {
                System.out.println("✗ No token found for protected endpoint");
            }
        } catch (UsernameNotFoundException ex) {
            System.out.println("✗ UsernameNotFoundException: " + ex.getMessage());
            log.debug("User not found during authentication: {}", ex.getMessage());
        } catch (JwtAuthenticationException ex) {
            System.out.println("✗ JwtAuthenticationException: " + ex.getMessage());
            log.warn("JWT authentication failed: {}", ex.getMessage());
        } catch (Exception ex) {
            System.out.println("✗ Unexpected exception: " + ex.getClass().getName() + " - " + ex.getMessage());
            log.error("Unexpected error in JWT authentication filter", ex);
        }

        System.out.println("=== JwtAuthenticationFilter END (continuing) ===\n");
        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestPath) {
        System.out.println("Checking if public endpoint...");
        for (String endpoint : PUBLIC_ENDPOINTS) {
            boolean matches = requestPath.startsWith(endpoint);
            System.out.println("  - Path '" + requestPath + "' startsWith '" + endpoint + "': " + matches);
            if (matches) {
                return true;
            }
        }
        return false;
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        System.out.println("Authorization header: " + (bearerToken != null ? "present" : "NOT present"));
        
        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            String token = bearerToken.substring(BEARER_PREFIX.length()).trim();
            System.out.println("Token extracted from Bearer header");
            return token.isEmpty() ? null : token;
        }
        return null;
    }
}
