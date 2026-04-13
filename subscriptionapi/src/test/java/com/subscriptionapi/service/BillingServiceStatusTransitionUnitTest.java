package com.subscriptionapi.service;

import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.exception.UnauthorizedException;
import com.subscriptionapi.repository.BillingRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ============================================================================
 * BILLING SERVICE STATUS TRANSITION UNIT TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests billing status transition logic at service layer.
 * Validates state changes: PENDING → PAID, PENDING → OVERDUE, etc.
 * 
 * TESTS:
 * - Status transition validation (PENDING → PAID only)
 * - Payment approval workflow
 * - Filter logic (by subscription, status)
 * - Amount calculations
 * ============================================================================
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Billing Service Status Transition Unit Tests")
@Slf4j
public class BillingServiceStatusTransitionUnitTest {

    @Mock
    private BillingRepository billingRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @InjectMocks
    private BillingServiceImpl billingService;

    private User customer;
    private User operator;
    private Plan plan;
    private Subscription subscription;
    private Billing billingPending;
    private Billing billingPaid;
    private Billing billingPaymentClaimed;

    @BeforeEach
    void setUp() {
        customer = User.builder()
            .id(1L)
            .email("customer@test.com")
            .firstName("John")
            .lastName("Doe")
            .build();

        operator = User.builder()
            .id(2L)
            .email("operator@test.com")
            .firstName("Jane")
            .lastName("Smith")
            .build();

        plan = Plan.builder()
            .id(1L)
            .user(operator)
            .name("Test Plan")
            .basePrice(BigDecimal.valueOf(99.99))
            .build();

        subscription = Subscription.builder()
            .id(1L)
            .user(customer)
            .plan(plan)
            .operator(operator)
            .status(SubscriptionStatus.ACTIVE)
            .build();

        billingPending = Billing.builder()
            .id(1L)
            .subscription(subscription)
            .amount(BigDecimal.valueOf(99.99))
            .billingDate(LocalDateTime.now().minusDays(10))
            .dueDate(LocalDateTime.now().minusDays(5))
            .status(BillingStatus.PENDING)
            .build();

        billingPaid = Billing.builder()
            .id(2L)
            .subscription(subscription)
            .amount(BigDecimal.valueOf(99.99))
            .billingDate(LocalDateTime.now().minusDays(30))
            .dueDate(LocalDateTime.now().minusDays(25))
            .paidDate(LocalDateTime.now().minusDays(20))
            .status(BillingStatus.PAID)
            .build();

        billingPaymentClaimed = Billing.builder()
            .id(3L)
            .subscription(subscription)
            .amount(BigDecimal.valueOf(99.99))
            .billingDate(LocalDateTime.now().minusDays(5))
            .dueDate(LocalDateTime.now())
            .status(BillingStatus.PAYMENT_CLAIMED)
            .build();
    }

    // ==================== APPROVAL WORKFLOW TESTS ====================

    @Test
    @DisplayName("approveBillingPayment: PAYMENT_CLAIMED → PAID (success)")
    void testApproveBillingPaymentSuccess() {
        when(billingRepository.findById(3L)).thenReturn(Optional.of(billingPaymentClaimed));
        when(billingRepository.save(any(Billing.class))).thenAnswer(invocation -> {
            Billing b = invocation.getArgument(0);
            b.setPaidDate(LocalDateTime.now());
            return b;
        });

        BillingResponseDTO result = billingService.approveBillingPayment(3L, 2L);

        assertEquals(BillingStatus.PAID, result.getStatus());
        assertNotNull(result.getPaidDate());
        verify(billingRepository, times(1)).save(any(Billing.class));
    }

    @Test
    @DisplayName("approveBillingPayment: Non-PAYMENT_CLAIMED status throws exception")
    void testApproveBillingPaymentWithNonClaimedStatus() {
        when(billingRepository.findById(1L)).thenReturn(Optional.of(billingPending));

        assertThrows(IllegalStateException.class, 
            () -> billingService.approveBillingPayment(1L, 2L));
        verify(billingRepository, never()).save(any());
    }

    @Test
    @DisplayName("approveBillingPayment: Non-existent billing throws ResourceNotFoundException")
    void testApproveBillingPaymentNotFound() {
        when(billingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, 
            () -> billingService.approveBillingPayment(999L, 2L));
    }

    @Test
    @DisplayName("approveBillingPayment: Wrong operator throws UnauthorizedException")
    void testApproveBillingPaymentUnauthorized() {
        when(billingRepository.findById(3L)).thenReturn(Optional.of(billingPaymentClaimed));

        assertThrows(UnauthorizedException.class, 
            () -> billingService.approveBillingPayment(3L, 999L));
        verify(billingRepository, never()).save(any());
    }

    // ==================== STATUS UPDATE TESTS ====================

    @Test
    @DisplayName("updateBillingStatus: PENDING → PAID sets paidDate")
    void testUpdateBillingStatusToPaid() {
        when(billingRepository.findById(1L)).thenReturn(Optional.of(billingPending));
        when(billingRepository.save(any(Billing.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BillingResponseDTO result = billingService.updateBillingStatus(1L, BillingStatus.PAID, billingPending.getSubscription().getUser().getId());

        assertEquals(BillingStatus.PAID, result.getStatus());
        assertNotNull(result.getPaidDate());
    }


    @Test
    @DisplayName("updateBillingStatus: Any status to FAILED")
    void testUpdateBillingStatusToFailed() {
        when(billingRepository.findById(1L)).thenReturn(Optional.of(billingPending));
        when(billingRepository.save(any(Billing.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BillingResponseDTO result = billingService.updateBillingStatus(1L, BillingStatus.FAILED, billingPending.getSubscription().getUser().getId());

        assertEquals(BillingStatus.FAILED, result.getStatus());
        assertNull(result.getPaidDate());
    }


    @Test
    @DisplayName("updateBillingStatus: Non-existent billing throws ResourceNotFoundException")
    void testUpdateBillingStatusNotFound() {
        when(billingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, 
            () -> billingService.updateBillingStatus(999L, BillingStatus.PAID, 1L));
    }

    // ==================== FILTER TESTS ====================

    @Test
    @DisplayName("getBillingsByStatus: Returns billings with specific status")
    void testGetBillingsByStatus() {
        when(billingRepository.findByStatus(BillingStatus.PAID))
            .thenReturn(java.util.List.of(billingPaid));

        var result = billingService.getBillingsByStatus(BillingStatus.PAID);

        assertEquals(1, result.size());
        assertEquals(BillingStatus.PAID, result.get(0).getStatus());
    }

    @Test
    @DisplayName("getBillingsBySubscription: Returns billings for subscription")
    void testGetBillingsBySubscription() {
        when(billingRepository.findBySubscriptionId(1L))
            .thenReturn(java.util.List.of(billingPending, billingPaid));

        var result = billingService.getBillingsBySubscription(1L);

        assertEquals(2, result.size());
    }
}
