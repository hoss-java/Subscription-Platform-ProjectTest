package com.subscriptionapi.repository;

import com.subscriptionapi.entity.Subscription;
import com.subscriptionapi.entity.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // Find subscriptions by customer (user)
    Page<Subscription> findByUserId(Long userId, Pageable pageable);
    
    // Find subscriptions by operator
    Page<Subscription> findByOperatorId(Long operatorId, Pageable pageable);
    
    // Find subscriptions by status
    Page<Subscription> findByStatus(SubscriptionStatus status, Pageable pageable);
    
    // Find subscriptions by user and status
    Page<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status, Pageable pageable);

    // Find subscriptions by plan
    Page<Subscription> findByPlanId(Long planId, Pageable pageable);
    
    // Find active subscriptions for a user
    List<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
    
    // Find subscription by user and plan
    Optional<Subscription> findByUserIdAndPlanId(Long userId, Long planId);
    
    // Find pending subscriptions for operator
    Page<Subscription> findByOperatorIdAndStatus(Long operatorId, SubscriptionStatus status, Pageable pageable);
}
