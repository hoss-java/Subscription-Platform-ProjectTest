package com.subscriptionapi.repository;

import com.subscriptionapi.entity.Billing;
import com.subscriptionapi.entity.BillingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {
    
    List<Billing> findBySubscriptionId(Long subscriptionId);
    
    List<Billing> findBySubscriptionUserIdOrderByBillingDateDesc(Long userId);
    
    List<Billing> findByStatus(BillingStatus status);
    
    List<Billing> findByBillingDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Billing> findByStatusAndDueDateBefore(BillingStatus status, LocalDateTime dueDate);
    
    Optional<Billing> findByIdAndSubscriptionUserId(Long id, Long userId);

    Optional<Billing> findBySubscriptionIdAndBillingDateBetween(Long subscriptionId, LocalDateTime startDate, LocalDateTime endDate);
}
