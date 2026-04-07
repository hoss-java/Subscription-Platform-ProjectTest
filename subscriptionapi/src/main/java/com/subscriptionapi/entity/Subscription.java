package com.subscriptionapi.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User cannot be null")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    @NotNull(message = "Plan cannot be null")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Plan plan;
    
    @ManyToOne
    @JoinColumn(name = "operator_id", nullable = false)
    @NotNull(message = "Operator cannot be null")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User operator;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.PENDING;
    
    @Column(nullable = false, updatable = false)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    private LocalDateTime endDate = LocalDateTime.now().plusMonths(1);
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean autoRenewal = true;
    
    @Column(nullable = true)
    @EqualsAndHashCode.Exclude
    private LocalDateTime nextRenewalDate;
    
    @Column(nullable = true)
    private String cancellationReason;
    
    @Column(nullable = false)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    private LocalDateTime updatedAt = LocalDateTime.now();
}
