package com.subscriptionapi.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Role Entity Unit Tests")
class RoleUnitTest {

    private Role role;
    private Permission mockPermission1;
    private Permission mockPermission2;
    private User mockUser1;
    private User mockUser2;

    @BeforeEach
    void setUp() {
        role = Role.builder()
                .id(1L)
                .name(RoleType.ADMIN)
                .description("Administrator role")
                .users(new HashSet<>())
                .permissions(new HashSet<>())
                .build();

        mockUser1 = new User();
        mockUser1.setId(1L);

        mockUser2 = new User();
        mockUser2.setId(2L);

        mockPermission1 = Permission.builder()
                .id(1L)
                .name("CREATE_USER")
                .description("Can create users")
                .build();

        mockPermission2 = Permission.builder()
                .id(2L)
                .name("DELETE_USER")
                .description("Can delete users")
                .build();
    }

    // ==================== PERMISSIONS COLLECTION TESTS ====================

    @ParameterizedTest
    @MethodSource("providePermissionsForAddition")
    @DisplayName("Should add permission(s) to role")
    void testAddPermissions(Set<Permission> permissionsToAdd, int expectedSize) {
        // Arrange & Act
        permissionsToAdd.forEach(p -> role.getPermissions().add(p));
        
        // Assert
        assertEquals(expectedSize, role.getPermissions().size());
        permissionsToAdd.forEach(p -> assertTrue(role.getPermissions().contains(p)));
    }

    @ParameterizedTest
    @MethodSource("providePermissionsForRemoval")
    @DisplayName("Should remove permission from role")
    void testRemovePermission(Set<Permission> permissionsToAdd, Permission permissionToRemove, int expectedSize) {
        // Arrange
        permissionsToAdd.forEach(p -> role.getPermissions().add(p));
        
        // Act
        role.getPermissions().remove(permissionToRemove);
        
        // Assert
        assertEquals(expectedSize, role.getPermissions().size());
        assertFalse(role.getPermissions().contains(permissionToRemove));
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 5})
    @DisplayName("Should clear all permissions regardless of count")
    void testClearAllPermissions(int permissionCount) {
        // Arrange
        for (int i = 0; i < permissionCount; i++) {
            Permission perm = Permission.builder()
                    .id((long) i)
                    .name("PERM_" + i)
                    .description("Permission " + i)
                    .build();
            role.getPermissions().add(perm);
        }
        
        // Act
        role.getPermissions().clear();
        
        // Assert
        assertTrue(role.getPermissions().isEmpty());
    }

    // ==================== USERS COLLECTION TESTS ====================

    @ParameterizedTest
    @MethodSource("provideUsersForAddition")
    @DisplayName("Should add user(s) to role")
    void testAddUsers(Set<User> usersToAdd, int expectedSize) {
        // Arrange & Act
        usersToAdd.forEach(u -> role.getUsers().add(u));
        
        // Assert
        assertEquals(expectedSize, role.getUsers().size());
        usersToAdd.forEach(u -> assertTrue(role.getUsers().contains(u)));
    }

    @ParameterizedTest
    @MethodSource("provideUsersForRemoval")
    @DisplayName("Should remove user from role")
    void testRemoveUser(Set<User> usersToAdd, User userToRemove, int expectedSize) {
        // Arrange
        usersToAdd.forEach(u -> role.getUsers().add(u));
        
        // Act
        role.getUsers().remove(userToRemove);
        
        // Assert
        assertEquals(expectedSize, role.getUsers().size());
        assertFalse(role.getUsers().contains(userToRemove));
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 5})
    @DisplayName("Should clear all users regardless of count")
    void testClearAllUsers(int userCount) {
        // Arrange
        for (int i = 0; i < userCount; i++) {
            User user = new User();
            user.setId((long) i);
            role.getUsers().add(user);
        }
        
        // Act
        role.getUsers().clear();
        
        // Assert
        assertTrue(role.getUsers().isEmpty());
    }

    // ==================== ROLE PROPERTIES ====================

    @ParameterizedTest
    @CsvSource({
        "5, 10, 15",
        "1, 2, 3",
        "100, 200, 300"
    })
    @DisplayName("Should set and get role id")
    void testSetGetId(Long id1, Long id2, Long id3) {
        role.setId(id1);
        assertEquals(id1, role.getId());
        
        role.setId(id2);
        assertEquals(id2, role.getId());
        
        role.setId(id3);
        assertEquals(id3, role.getId());
    }

    @ParameterizedTest
    @MethodSource("provideRoleTypes")
    @DisplayName("Should set and get role name")
    void testSetGetName(RoleType roleType) {
        // Act
        role.setName(roleType);
        
        // Assert
        assertEquals(roleType, role.getName());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "New description",
        "Administrator role",
        "Customer support role",
        "Operator role"
    })
    @DisplayName("Should set and get description")
    void testSetGetDescription(String description) {
        // Act
        role.setDescription(description);
        
        // Assert
        assertEquals(description, role.getDescription());
    }

    @ParameterizedTest
    @MethodSource("provideRoleTypesForInitialization")
    @DisplayName("Should initialize with empty collections")
    void testEmptyCollectionsInitialization(RoleType roleType, String description) {
        // Arrange & Act
        Role newRole = Role.builder()
                .name(roleType)
                .description(description)
                .build();
        
        // Assert
        assertTrue(newRole.getPermissions().isEmpty());
        assertTrue(newRole.getUsers().isEmpty());
        assertEquals(roleType, newRole.getName());
        assertEquals(description, newRole.getDescription());
    }

    // ==================== HELPER METHODS ====================

    private static Stream<org.junit.jupiter.params.provider.Arguments> providePermissionsForAddition() {
        Permission perm1 = Permission.builder().id(1L).name("CREATE_USER").description("Can create users").build();
        Permission perm2 = Permission.builder().id(2L).name("DELETE_USER").description("Can delete users").build();
        
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(Set.of(perm1), 1),
            org.junit.jupiter.params.provider.Arguments.of(Set.of(perm1, perm2), 2)
        );
    }

    private static Stream<org.junit.jupiter.params.provider.Arguments> providePermissionsForRemoval() {
        Permission perm1 = Permission.builder().id(1L).name("CREATE_USER").description("Can create users").build();
        Permission perm2 = Permission.builder().id(2L).name("DELETE_USER").description("Can delete users").build();
        
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(
                Set.of(perm1, perm2),
                perm1,
                1
            ),
            org.junit.jupiter.params.provider.Arguments.of(
                Set.of(perm1, perm2),
                perm2,
                1
            )
        );
    }

    private static Stream<org.junit.jupiter.params.provider.Arguments> provideUsersForAddition() {
        User user1 = new User();
        user1.setId(1L);
        
        User user2 = new User();
        user2.setId(2L);
        
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(Set.of(user1), 1),
            org.junit.jupiter.params.provider.Arguments.of(Set.of(user1, user2), 2)
        );
    }

    private static Stream<org.junit.jupiter.params.provider.Arguments> provideUsersForRemoval() {
        User user1 = new User();
        user1.setId(1L);
        
        User user2 = new User();
        user2.setId(2L);
        
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(
                Set.of(user1, user2),
                user1,
                1
            ),
            org.junit.jupiter.params.provider.Arguments.of(
                Set.of(user1, user2),
                user2,
                1
            )
        );
    }

    private static Stream<RoleType> provideRoleTypes() {
        return Stream.of(RoleType.CUSTOMER, RoleType.OPERATOR, RoleType.ADMIN);
    }

    private static Stream<org.junit.jupiter.params.provider.Arguments> provideRoleTypesForInitialization() {
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(RoleType.ADMIN, "Administrator role"),
            org.junit.jupiter.params.provider.Arguments.of(RoleType.CUSTOMER, "Customer role"),
            org.junit.jupiter.params.provider.Arguments.of(RoleType.OPERATOR, "Operator role")
        );
    }
}
