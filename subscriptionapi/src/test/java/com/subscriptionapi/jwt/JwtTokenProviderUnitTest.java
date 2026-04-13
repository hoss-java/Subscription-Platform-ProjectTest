package com.subscriptionapi.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.util.ReflectionTestUtils;

import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.RefreshToken;
import com.subscriptionapi.repository.RefreshTokenRepository;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtTokenProvider Unit Tests")
class JwtTokenProviderUnitTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private Role testRole;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testRole = new Role();
        testRole.setId(1L);
        testRole.setName(RoleType.CUSTOMER);  // ← Use CUSTOMER from your enum

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedPassword");
        testUser.setRoles(Set.of(testRole));

        // Set JWT configuration values using reflection
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "mySecretKeyThatIsAtLeast256BitsLongForHmacSha256Algorithm");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenExpirationMs", 86400000L); // 24 hours
    }

    // ==================== Token Generation Tests ====================

    @Test
    @DisplayName("Should generate valid JWT token with correct claims")
    void testGenerateToken_Success() {
        // Act
        String token = jwtTokenProvider.generateToken(testUser);

        // Assert
        assertNotNull(token);
        assertTrue(jwtTokenProvider.isTokenValid(token));
        assertEquals(testUser.getEmail(), jwtTokenProvider.getEmailFromToken(token));
        assertEquals(testUser.getId(), jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    @DisplayName("Should generate refresh token successfully")
    void testGenerateRefreshToken_Success() {
        // Act
        String refreshToken = jwtTokenProvider.generateRefreshToken(testUser);

        // Assert
        assertNotNull(refreshToken);
        assertTrue(jwtTokenProvider.isTokenValid(refreshToken));
        assertEquals(testUser.getEmail(), jwtTokenProvider.getEmailFromToken(refreshToken));
    }

    @ParameterizedTest
    @DisplayName("Should generate tokens for different users with different roles")
    @CsvSource({
            "user1@example.com, 1, CUSTOMER",
            "user2@example.com, 2, OPERATOR",
            "user3@example.com, 3, ADMIN"
    })
    void testGenerateToken_MultipleUsers(String email, Long userId, String roleType) {
        // Arrange
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        
        Role role = new Role();
        role.setId(1L);
        role.setName(RoleType.valueOf(roleType));  // ← Convert string to enum
        user.setRoles(Set.of(role));

        // Act
        String token = jwtTokenProvider.generateToken(user);

        // Assert
        assertNotNull(token);
        assertEquals(email, jwtTokenProvider.getEmailFromToken(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
    }

    // ==================== Token Validation Tests ====================

    @Test
    @DisplayName("Should validate correct token")
    void testIsTokenValid_ValidToken() {
        // Arrange
        String token = jwtTokenProvider.generateToken(testUser);

        // Act
        boolean isValid = jwtTokenProvider.isTokenValid(token);

        // Assert
        assertTrue(isValid);
    }

    @ParameterizedTest
    @DisplayName("Should reject invalid tokens")
    @ValueSource(strings = {
            "invalidToken",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.invalid",
            "",
            "   "
    })
    void testIsTokenValid_InvalidTokens(String invalidToken) {
        // Act
        boolean isValid = jwtTokenProvider.isTokenValid(invalidToken);

        // Assert
        assertFalse(isValid);
    }

    // ==================== Token Claims Extraction Tests ====================

    @Test
    @DisplayName("Should extract email from token")
    void testGetEmailFromToken_Success() {
        // Arrange
        String token = jwtTokenProvider.generateToken(testUser);

        // Act
        String email = jwtTokenProvider.getEmailFromToken(token);

        // Assert
        assertEquals(testUser.getEmail(), email);
    }

    @Test
    @DisplayName("Should extract user ID from token")
    void testGetUserIdFromToken_Success() {
        // Arrange
        String token = jwtTokenProvider.generateToken(testUser);

        // Act
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        // Assert
        assertEquals(testUser.getId(), userId);
    }

    @ParameterizedTest
    @DisplayName("Should extract correct user IDs from different tokens")
    @ValueSource(longs = {1L, 2L, 100L, 999L})
    void testGetUserIdFromToken_DifferentIds(Long userId) {
        // Arrange
        User user = new User();
        user.setId(userId);
        user.setEmail("test" + userId + "@example.com");
        
        Role role = new Role();
        role.setId(1L);
        role.setName(RoleType.CUSTOMER);
        user.setRoles(Set.of(role));
        
        String token = jwtTokenProvider.generateToken(user);

        // Act
        Long extractedId = jwtTokenProvider.getUserIdFromToken(token);

        // Assert
        assertEquals(userId, extractedId);
    }

    // ==================== Refresh Token Tests ====================

    @Test
    @DisplayName("Should save refresh token successfully")
    void testSaveRefreshToken_Success() {
        // Arrange
        String refreshToken = jwtTokenProvider.generateRefreshToken(testUser);

        // Act
        jwtTokenProvider.saveRefreshToken(testUser, refreshToken);

        // Assert
        verify(refreshTokenRepository, times(1)).deleteByUser(testUser);
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should validate existing refresh token")
    void testIsRefreshTokenValid_ValidToken() {
        // Arrange
        String tokenString = "validRefreshToken";
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenString)
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .isRevoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenString))
                .thenReturn(Optional.of(refreshToken));

        // Act
        boolean isValid = jwtTokenProvider.isRefreshTokenValid(tokenString);

        // Assert
        assertTrue(isValid);
        verify(refreshTokenRepository, times(1)).findByToken(tokenString);
    }

    @Test
    @DisplayName("Should reject non-existent refresh token")
    void testIsRefreshTokenValid_NonExistentToken() {
        // Arrange
        String tokenString = "nonExistentToken";
        when(refreshTokenRepository.findByToken(tokenString))
                .thenReturn(Optional.empty());

        // Act
        boolean isValid = jwtTokenProvider.isRefreshTokenValid(tokenString);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject revoked refresh token")
    void testIsRefreshTokenValid_RevokedToken() {
        // Arrange
        String tokenString = "revokedToken";
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenString)
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .isRevoked(true)
                .build();

        when(refreshTokenRepository.findByToken(tokenString))
                .thenReturn(Optional.of(refreshToken));

        // Act
        boolean isValid = jwtTokenProvider.isRefreshTokenValid(tokenString);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject expired refresh token")
    void testIsRefreshTokenValid_ExpiredToken() {
        // Arrange
        String tokenString = "expiredToken";
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenString)
                .user(testUser)
                .expiryDate(LocalDateTime.now().minusDays(1))
                .isRevoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenString))
                .thenReturn(Optional.of(refreshToken));

        // Act
        boolean isValid = jwtTokenProvider.isRefreshTokenValid(tokenString);

        // Assert
        assertFalse(isValid);
    }

    @ParameterizedTest
    @DisplayName("Should revoke refresh tokens")
    @ValueSource(strings = {"token1", "token2", "token3"})
    void testRevokeRefreshToken_Success(String tokenString) {
        // Arrange
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenString)
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .isRevoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenString))
                .thenReturn(Optional.of(refreshToken));

        // Act
        jwtTokenProvider.revokeRefreshToken(tokenString);

        // Assert
        verify(refreshTokenRepository, times(1)).findByToken(tokenString);
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
        assertTrue(refreshToken.getIsRevoked());
    }

    @Test
    @DisplayName("Should handle revoke non-existent token gracefully")
    void testRevokeRefreshToken_NonExistentToken() {
        // Arrange
        String tokenString = "nonExistentToken";
        when(refreshTokenRepository.findByToken(tokenString))
                .thenReturn(Optional.empty());

        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> jwtTokenProvider.revokeRefreshToken(tokenString));
        verify(refreshTokenRepository, times(1)).findByToken(tokenString);
        verify(refreshTokenRepository, never()).save(any());
    }
}
