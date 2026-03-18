package com.subscriptionapi.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PermissionEntityTest {

    @Test
    void testPermissionEntityCreation() {
        Permission permission = Permission.builder()
                .name("READ_USER")
                .description("Read user permission")
                .build();

        assertNotNull(permission);
        assertEquals("READ_USER", permission.getName());
        assertEquals("Read user permission", permission.getDescription());
    }

    @Test
    void testPermissionUniqueName() {
        Permission permission1 = Permission.builder()
                .name("DELETE_USER")
                .description("Delete user permission")
                .build();

        Permission permission2 = Permission.builder()
                .name("DELETE_USER")
                .description("Another delete permission")
                .build();

        assertEquals(permission1.getName(), permission2.getName());
    }
}
