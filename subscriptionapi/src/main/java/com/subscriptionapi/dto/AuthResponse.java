package com.subscriptionapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    
    private String message;
    
    private String token;
    
    private UserDetails userDetails;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDetails {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private Boolean isActive;
    }
}
