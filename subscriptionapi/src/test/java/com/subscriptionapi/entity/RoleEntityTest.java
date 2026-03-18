package com.subscriptionapi.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.HashSet;
import java.util.Set;

class RoleEntityTest {

    @Test
    void testRoleEntityCreation() {
        Role role = Role.builder()
                .name(RoleType.ADMIN)
                .description("Administrator role")
                .build();

        assertNotNull(role);
        assertEquals(RoleType.ADMIN, role.getName());
        assertEquals("Administrator role", role.getDescription());
    }

    @Test
    void testRolePermissionRelationship() {
        Role role = Role.builder()
                .name(RoleType.ADMIN)
                .description("Administrator role")
                .build();

        Permission permission = Permission.builder()
                .name("CREATE_USER")
                .description("Create user permission")
                .build();

        role.getPermissions().add(permission);
        permission.getRoles().add(role);

        assertEquals(1, role.getPermissions().size());
        assertTrue(role.getPermissions().contains(permission));
        assertEquals(1, permission.getRoles().size());
        assertTrue(permission.getRoles().contains(role));
    }

    @Test
    void testRoleTypes() {
        Role customerRole = Role.builder()
                .name(RoleType.CUSTOMER)
                .description("Customer role")
                .build();

        Role operatorRole = Role.builder()
                .name(RoleType.OPERATOR)
                .description("Operator role")
                .build();

        Role adminRole = Role.builder()
                .name(RoleType.ADMIN)
                .description("Admin role")
                .build();

        assertEquals(RoleType.CUSTOMER, customerRole.getName());
        assertEquals(RoleType.OPERATOR, operatorRole.getName());
        assertEquals(RoleType.ADMIN, adminRole.getName());
    }
}
