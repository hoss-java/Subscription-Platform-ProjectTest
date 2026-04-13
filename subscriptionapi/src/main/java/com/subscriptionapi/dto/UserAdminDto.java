package com.subscriptionapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
    private Boolean active;
    private LocalDateTime createdAt;
}