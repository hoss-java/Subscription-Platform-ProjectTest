package com.subscriptionapi.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

class UserEntityTest {

    @Test
    void testUserEntityCreation() {
        User user = User.builder()
                .email("test@example.com")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .isActive(true)
                .build();

        assertNotNull(user);
        assertEquals("test@example.com", user.getEmail());
        assertEquals("John", user.getFirstName());
        assertTrue(user.getIsActive());
    }

    @Test
    void testUserRoleRelationship() {
        User user = User.builder()
                .email("test@example.com")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .build();

        Role role = Role.builder()
                .name(RoleType.CUSTOMER)
                .description("Customer role")
                .build();

        user.getRoles().add(role);
        role.getUsers().add(user);

        assertEquals(1, user.getRoles().size());
        assertTrue(user.getRoles().contains(role));
        assertEquals(1, role.getUsers().size());
        assertTrue(role.getUsers().contains(user));
    }

    @Test
    void testUserValidation() {
        User user = User.builder()
                .email("invalid-email")
                .password("123")
                .firstName("")
                .lastName("Doe")
                .build();

        assertNotNull(user);
    }
}
