package com.subscriptionapi.jwt;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.RefreshToken;
import com.subscriptionapi.repository.RefreshTokenRepository;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpirationMs;
    
    private final RefreshTokenRepository refreshTokenRepository;

    // Add this constructor
    public JwtTokenProvider(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("roles", user.getRoles().stream()
                .map(role -> role.getName().toString())
                .collect(Collectors.toList()));
        return createToken(claims, user.getEmail(), jwtExpirationMs);
    }

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        return createToken(claims, user.getEmail(), refreshTokenExpirationMs);
    }

    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return getAllClaimsFromToken(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        return getAllClaimsFromToken(token).get("id", Long.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public void saveRefreshToken(User user, String refreshToken) {
        refreshTokenRepository.deleteByUser(user);
        
        RefreshToken token = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .isRevoked(false)
                .build();
        
        refreshTokenRepository.save(token);
    }
    
    public boolean isRefreshTokenValid(String token) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByToken(token);
        
        if (refreshToken.isEmpty()) {
            return false;
        }
        
        RefreshToken rt = refreshToken.get();
        return !rt.getIsRevoked() && rt.getExpiryDate().isAfter(LocalDateTime.now());
    }
    
    public void revokeRefreshToken(String token) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByToken(token);
        refreshToken.ifPresent(rt -> {
            rt.setIsRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    public String generatePasswordResetToken() {
        return UUID.randomUUID().toString();
    }
}
