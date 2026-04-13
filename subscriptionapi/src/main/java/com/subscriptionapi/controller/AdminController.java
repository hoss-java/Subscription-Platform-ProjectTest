package com.subscriptionapi.controller;

import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.service.UserService;
import com.subscriptionapi.dto.AdminUsersResponse;
import com.subscriptionapi.dto.UserAdminDto;
import com.subscriptionapi.dto.UpdateUserRoleRequest;
import com.subscriptionapi.dto.UpdateUserStatusRequest;
import com.subscriptionapi.dto.UpdateUserRequest;
import com.subscriptionapi.dto.RoleDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    
    /**
     * Get all users for admin management
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUsersResponse> getUsers() {
        List<User> allUsers = userRepository.findAll();
        List<UserAdminDto> userDtos = allUsers.stream()
            .map(user -> new UserAdminDto(
                user.getId(),
                user.getEmail(),
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName(),
                user.getRoles().stream()
                    .map(role -> role.getName().toString())
                    .collect(Collectors.toList()),
                user.getIsActive(),
                user.getCreatedAt()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(new AdminUsersResponse(userDtos));
    }
    
    /**
     * Get single user details
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAdminDto> getUserDetails(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserAdminDto dto = new UserAdminDto(
            user.getId(),
            user.getEmail(),
            user.getEmail(),
            user.getFirstName() + " " + user.getLastName(),
            user.getRoles().stream()
                .map(role -> role.getName().toString())
                .collect(Collectors.toList()),
            user.getIsActive(),
            user.getCreatedAt()
        );
        
        return ResponseEntity.ok(dto);
    }
    
    /**
     * Update user role and status
     */
    @PutMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAdminDto> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update role if provided
        if (request.getRole() != null) {
            RoleType roleType = RoleType.valueOf(request.getRole().toUpperCase());
            Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found"));
            user.getRoles().clear();
            user.getRoles().add(role);
        }
        
        // Update active status if provided
        if (request.getActive() != null) {
            user.setIsActive(request.getActive());
        }
        
        User updatedUser = userRepository.save(user);
        
        UserAdminDto dto = convertToDto(updatedUser);
        return ResponseEntity.ok(dto);
    }

    /**
     * Update user role only
     */
    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAdminDto> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        RoleType roleType = RoleType.valueOf(request.getRole().toUpperCase());
        Role role = roleRepository.findByName(roleType)
            .orElseThrow(() -> new RuntimeException("Role not found"));
        
        user.getRoles().clear();
        user.getRoles().add(role);
        User updatedUser = userRepository.save(user);
        
        UserAdminDto dto = convertToDto(updatedUser);
        return ResponseEntity.ok(dto);
    }
    
    /**
     * Update user active/inactive status
     */
    @PatchMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAdminDto> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsActive(request.getActive());  // Changed from setActive()
        User updatedUser = userRepository.save(user);
        
        UserAdminDto dto = convertToDto(updatedUser);
        return ResponseEntity.ok(dto);
    }
    
    /**
     * Helper method to convert User to UserAdminDto
     */
    private UserAdminDto convertToDto(User user) {
        return new UserAdminDto(
            user.getId(),
            user.getEmail(),
            user.getEmail(),
            user.getFirstName() + " " + user.getLastName(),
            user.getRoles().stream()
                .map(role -> role.getName().toString())
                .collect(Collectors.toList()),
            user.getIsActive(),
            user.getCreatedAt()
        );
    }

    /**
     * Get all available roles
     */
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleDto>> getAvailableRoles() {
        List<RoleDto> roleDtos = new ArrayList<>();
        
        for (RoleType roleType : RoleType.values()) {
            roleDtos.add(new RoleDto(
                roleType.toString(),  // Just "ADMIN", not "ROLE_ADMIN"
                roleType.toString().charAt(0) + 
                roleType.toString().substring(1).toLowerCase()
            ));
        }
        
        return ResponseEntity.ok(roleDtos);
    }

}
