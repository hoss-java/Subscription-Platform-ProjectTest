package com.subscriptionapi.entity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    @NotNull(message = "Role name cannot be null")
    @Enumerated(EnumType.STRING)
    private RoleType name;    

    @Column(nullable = false)
    @NotBlank(message = "Description cannot be blank")
    private String description;

    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    private Set<User> users = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    /**
     * Checks if this role has equal or higher hierarchy than the provided role.
     * Hierarchy: ADMIN > OPERATOR > CUSTOMER
     */
    public boolean hasHierarchyOver(RoleType otherRole) {
        return this.getHierarchyLevel() >= getRoleHierarchyLevel(otherRole);
    }

    public int getHierarchyLevel() {
        return getRoleHierarchyLevel(this.name);
    }

    private static int getRoleHierarchyLevel(RoleType roleType) {
        return switch (roleType) {
            case ADMIN -> 3;
            case OPERATOR -> 2;
            case CUSTOMER -> 1;
        };
    }
}

