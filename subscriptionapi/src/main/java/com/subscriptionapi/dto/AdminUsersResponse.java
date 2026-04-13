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
public class AdminUsersResponse {
    private List<UserAdminDto> users;
    private int totalCount;
    private LocalDateTime retrievedAt;
    
    public AdminUsersResponse(List<UserAdminDto> users) {
        this.users = users;
        this.totalCount = users.size();
        this.retrievedAt = LocalDateTime.now();
    }
}