package com.subscriptionapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;

import com.subscriptionapi.security.JwtAuthenticationFilter;
import com.subscriptionapi.jwt.JwtTokenProvider;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("DEBUG: Building SecurityFilterChain");
        
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // ✅ ADD THE FILTER FIRST, BEFORE authorizeHttpRequests
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> {
                System.out.println("DEBUG: Configuring authorization rules");
                auth
                    // Public endpoints - POST only
                    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    
                    // Protected endpoints
                    .requestMatchers(HttpMethod.GET, "/api/user/profile").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/admin/users").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/admin/dashboard").hasRole("ADMIN")
                    
                    // Everything else requires authentication
                    .anyRequest().authenticated();
            })
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    String requestPath = ((HttpServletRequest) request).getRequestURI();
                    String method = ((HttpServletRequest) request).getMethod();
                    System.out.println("DEBUG: UNAUTHORIZED - Method: " + method + ", Path: " + requestPath);
                    System.out.println("DEBUG: Exception message: " + authException.getMessage());
                    
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"message\": \"Unauthorized\", \"status\": 401}");
                })
            )
            .httpBasic(basic -> basic.disable());
        
        System.out.println("DEBUG: SecurityFilterChain built successfully");
        return http.build();
    }
}
