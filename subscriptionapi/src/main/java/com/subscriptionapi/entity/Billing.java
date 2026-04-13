package com.subscriptionapi.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "billings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    @NotNull(message = "Subscription cannot be null")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Subscription subscription;

    @Column(nullable = false)
    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @Column(nullable = false)
    private LocalDateTime billingDate;
    
    @Column(nullable = false)
    private LocalDateTime dueDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BillingStatus status = BillingStatus.PENDING;
    
    @Column(nullable = true)
    private LocalDateTime paidDate;
    
    @Column(nullable = false, updatable = false)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    private LocalDateTime updatedAt = LocalDateTime.now();
}
