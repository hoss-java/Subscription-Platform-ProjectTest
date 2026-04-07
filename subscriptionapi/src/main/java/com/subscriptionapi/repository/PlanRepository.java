package com.subscriptionapi.repository;

import com.subscriptionapi.entity.Plan;
import com.subscriptionapi.entity.PlanStatus;
import com.subscriptionapi.entity.ServiceType;
import com.subscriptionapi.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {
    
    // Find plans by user (operator)
    Page<Plan> findByUserId(Long userId, Pageable pageable);
    
    // Find active plans with pagination
    Page<Plan> findByStatus(PlanStatus status, Pageable pageable);
    
    // Find plans by service type
    Page<Plan> findByServiceType(ServiceType serviceType, Pageable pageable);
    
    // Search plans by name or description
    @Query("SELECT p FROM Plan p WHERE p.status = :status AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Plan> searchPlans(@Param("query") String query, @Param("status") PlanStatus status, Pageable pageable);
    
    // Find plans by user and service type
    Page<Plan> findByUserIdAndServiceType(Long userId, ServiceType serviceType, Pageable pageable);
    
    // Find plan by name and user (for initializer)
    Optional<Plan> findByNameAndUser(String name, User user);
}
