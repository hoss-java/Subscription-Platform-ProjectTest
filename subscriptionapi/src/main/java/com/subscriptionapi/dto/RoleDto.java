package com.subscriptionapi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {
    private String value;      // e.g., "ROLE_ADMIN"
    private String label;      // e.g., "Admin"
}
