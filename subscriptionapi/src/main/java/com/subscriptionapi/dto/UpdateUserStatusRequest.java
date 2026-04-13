package com.subscriptionapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
    
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {
    @NotNull(message = "Active status cannot be null")
    private Boolean active;
}