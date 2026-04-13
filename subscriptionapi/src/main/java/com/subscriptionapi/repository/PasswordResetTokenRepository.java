package com.subscriptionapi.repository;

import com.subscriptionapi.entity.PasswordResetToken;
import com.subscriptionapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByUserAndIsUsedFalse(User user);
    
    void deleteByExpirationTimeBefore(LocalDateTime dateTime);
}
