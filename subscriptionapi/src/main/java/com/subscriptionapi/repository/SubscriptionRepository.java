package com.subscriptionapi.repository;

import com.subscriptionapi.entity.Subscription;
import com.subscriptionapi.entity.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // Find subscriptions by customer (user)
    Page<Subscription> findByUserId(Long userId, Pageable pageable);
    
    // Find subscriptions by operator
    Page<Subscription> findByOperatorId(Long operatorId, Pageable pageable);
    
    // Find subscriptions by status with pagination
    Page<Subscription> findByStatus(SubscriptionStatus status, Pageable pageable);
    
    // Find all subscriptions by status without pagination
    List<Subscription> findByStatus(SubscriptionStatus status);
    
    // Find subscriptions by user and status with pagination
    Page<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status, Pageable pageable);

    // Find subscriptions by plan with pagination
    Page<Subscription> findByPlanId(Long planId, Pageable pageable);
    
    // Find active subscriptions for a user without pagination
    List<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
    
    // Find subscription by user and plan
    Optional<Subscription> findByUserIdAndPlanId(Long userId, Long planId);
    
    // Find pending subscriptions for operator with pagination
    Page<Subscription> findByOperatorIdAndStatus(Long operatorId, SubscriptionStatus status, Pageable pageable);

    Page<Subscription> findByUserIdAndPlanNameContainingIgnoreCase(Long userId, String planName, Pageable pageable);

    Page<Subscription> findByUserIdAndPlanServiceType(Long userId, String serviceType, Pageable pageable);
}
