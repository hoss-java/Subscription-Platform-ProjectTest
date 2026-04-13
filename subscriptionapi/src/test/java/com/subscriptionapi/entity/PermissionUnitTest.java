package com.subscriptionapi.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import java.util.stream.Stream;

@ExtendWith(MockitoExtension.class)
@DisplayName("Permission Entity Unit Tests")
public class PermissionUnitTest {
    
    private Permission permission;
    private Validator validator;
    
    @Mock
    private Set<Role> mockRoles;
    
    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }
    
    @ParameterizedTest
    @CsvSource({
        "1, READ_USER, Permission to read user data",
        "2, WRITE_USER, Permission to write user data",
        "3, DELETE_USER, Permission to delete user data"
    })
    @DisplayName("Should create permission with valid data")
    public void testPermissionCreationWithValidData(Long id, String name, String description) {
        // Arrange & Act
        permission = Permission.builder()
            .id(id)
            .name(name)
            .description(description)
            .roles(mockRoles)
            .build();
        
        // Assert
        assertEquals(id, permission.getId());
        assertEquals(name, permission.getName());
        assertEquals(description, permission.getDescription());
        assertEquals(mockRoles, permission.getRoles());
    }
    
    @ParameterizedTest
    @ValueSource(strings = {"", " "})
    @DisplayName("Should fail validation when permission name is blank or empty")
    public void testPermissionNameNotBlank(String invalidName) {
        // Arrange & Act
        permission = Permission.builder()
            .id(1L)
            .name(invalidName)
            .description("Permission to read user data")
            .roles(mockRoles)
            .build();
        
        Set<ConstraintViolation<Permission>> violations = validator.validate(permission);
        
        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Permission name cannot be blank")));
    }
    
    @ParameterizedTest
    @ValueSource(strings = {"", " "})
    @DisplayName("Should fail validation when description is blank or empty")
    public void testPermissionDescriptionNotBlank(String invalidDescription) {
        // Arrange & Act
        permission = Permission.builder()
            .id(1L)
            .name("READ_USER")
            .description(invalidDescription)
            .roles(mockRoles)
            .build();
        
        Set<ConstraintViolation<Permission>> violations = validator.validate(permission);
        
        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Description cannot be blank")));
    }
    
    @ParameterizedTest
    @MethodSource("provideValidPermissions")
    @DisplayName("Should assign mocked roles to permission and verify properties")
    public void testPermissionWithMockedRoles(Long id, String name, String description) {
        // Arrange & Act
        permission = Permission.builder()
            .id(id)
            .name(name)
            .description(description)
            .roles(mockRoles)
            .build();
        
        // Assert
        assertNotNull(permission.getRoles());
        assertEquals(mockRoles, permission.getRoles());
        assertEquals(id, permission.getId());
        assertEquals(name, permission.getName());
    }
    
    @ParameterizedTest
    @MethodSource("providePermissionPairs")
    @DisplayName("Should verify permission equality")
    public void testPermissionEquality(Permission permission1, Permission permission2) {
        // Assert
        assertEquals(permission1, permission2);
    }
    
    @ParameterizedTest
    @ValueSource(strings = {"READ_USER", "WRITE_USER", "DELETE_USER", "ADMIN"})
    @DisplayName("Should handle null name validation with different permission types")
    public void testPermissionNullName(String validName) {
        // Arrange & Act
        permission = Permission.builder()
            .id(1L)
            .name(null)
            .description("Permission to " + validName.toLowerCase())
            .roles(mockRoles)
            .build();
        
        Set<ConstraintViolation<Permission>> violations = validator.validate(permission);
        
        // Assert
        assertFalse(violations.isEmpty());
    }
    
    // Static helper method to provide valid permission data
    private static Stream<org.junit.jupiter.params.provider.Arguments> provideValidPermissions() {
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(2L, "WRITE_USER", "Permission to write user data"),
            org.junit.jupiter.params.provider.Arguments.of(3L, "DELETE_USER", "Permission to delete user data"),
            org.junit.jupiter.params.provider.Arguments.of(4L, "ADMIN", "Permission to administer system")
        );
    }
    
    // Static helper method to provide permission pairs for equality testing
    private static Stream<org.junit.jupiter.params.provider.Arguments> providePermissionPairs() {
        Set<Role> mockRoles = new java.util.HashSet<>();
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(
                Permission.builder().id(1L).name("READ_USER").description("Read permission").roles(mockRoles).build(),
                Permission.builder().id(1L).name("READ_USER").description("Read permission").roles(mockRoles).build()
            ),
            org.junit.jupiter.params.provider.Arguments.of(
                Permission.builder().id(2L).name("WRITE_USER").description("Write permission").roles(mockRoles).build(),
                Permission.builder().id(2L).name("WRITE_USER").description("Write permission").roles(mockRoles).build()
            )
        );
    }
}
