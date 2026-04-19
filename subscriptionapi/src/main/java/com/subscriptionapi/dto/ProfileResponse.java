package com.subscriptionapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean isActive;
    private Set<String> roles;
}
