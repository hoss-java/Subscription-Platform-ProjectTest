package com.subscriptionapi.service;

import com.subscriptionapi.dto.SubscriptionCreateRequest;
import com.subscriptionapi.dto.SubscriptionResponseDTO;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.repository.PlanRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import com.subscriptionapi.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * ============================================================================
 * SUBSCRIPTION SERVICE UNIT TEST SUITE (TRUE UNIT TEST)
 * ============================================================================
 * 
 * Pure unit tests with mocked dependencies - NO Spring context, NO database
 * Tests SubscriptionService business logic in isolation
 * 
 * ============================================================================
 */
@Slf4j
@ExtendWith(MockitoExtension.class)
@DisplayName("Subscription Service Unit Tests (Mocked)")
public class SubscriptionServiceUnitTest {
    
    @Mock
    private SubscriptionRepository subscriptionRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PlanRepository planRepository;
    
    @InjectMocks
    private SubscriptionService subscriptionService;
    
    private User testCustomer;
    private User testOperator;
    private Plan testPlan;
    private Subscription testSubscription;
    private Role customerRole;
    private Role operatorRole;
    
    private static final Long CUSTOMER_ID = 1L;
    private static final Long OPERATOR_ID = 2L;
    private static final Long PLAN_ID = 1L;
    private static final Long SUBSCRIPTION_ID = 1L;
    private static final String CUSTOMER_EMAIL = "customer@example.com";
    private static final String OPERATOR_EMAIL = "operator@example.com";
    
    @BeforeEach
    public void setUp() {
        // Create roles
        customerRole = Role.builder()
                .id(1L)
                .name(RoleType.CUSTOMER)
                .description("Customer role")
                .permissions(new HashSet<>())
                .users(new HashSet<>())
                .build();
        
        operatorRole = Role.builder()
                .id(2L)
                .name(RoleType.OPERATOR)
                .description("Operator role")
                .permissions(new HashSet<>())
                .users(new HashSet<>())
                .build();
        
        // Create test customer
        testCustomer = User.builder()
                .id(CUSTOMER_ID)
                .email(CUSTOMER_EMAIL)
                .password("encodedPassword123!")
                .firstName("Customer")
                .lastName("Test")
                .isActive(true)
                .roles(new HashSet<>())
                .build();
        testCustomer.getRoles().add(customerRole);
        
        // Create test operator
        testOperator = User.builder()
                .id(OPERATOR_ID)
                .email(OPERATOR_EMAIL)
                .password("encodedPassword123!")
                .firstName("Operator")
                .lastName("Test")
                .isActive(true)
                .roles(new HashSet<>())
                .build();
        testOperator.getRoles().add(operatorRole);
        
        // Create test plan
        testPlan = Plan.builder()
                .id(PLAN_ID)
                .user(testOperator)
                .name("Premium Plan")
                .description("Premium subscription plan")
                .serviceType(ServiceType.INTERNET)
                .basePrice(BigDecimal.valueOf(99.99))
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("Feature 1, Feature 2")
                .status(PlanStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // Create test subscription
        testSubscription = Subscription.builder()
                .id(SUBSCRIPTION_ID)
                .user(testCustomer)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.PENDING)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
    }
    
    // ============================================================================
    // CREATE SUBSCRIPTION TESTS
    // ============================================================================
    
    @ParameterizedTest(name = "Auto Renewal: {0}")
    @DisplayName("Should create subscription with correct auto renewal setting")
    @ValueSource(booleans = {true, false})
    public void testCreateSubscriptionWithAutoRenewal(boolean autoRenewal) {
        // Arrange
        SubscriptionCreateRequest request = SubscriptionCreateRequest.builder()
                .planId(PLAN_ID)
                .autoRenewal(autoRenewal)
                .build();
        
        Subscription subscriptionWithAutoRenewal = Subscription.builder()
                .id(SUBSCRIPTION_ID)
                .user(testCustomer)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.PENDING)
                .autoRenewal(autoRenewal)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
        
        when(userRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(testCustomer));
        when(planRepository.findById(PLAN_ID)).thenReturn(Optional.of(testPlan));
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(subscriptionWithAutoRenewal);
        
        // Act
        SubscriptionResponseDTO result = subscriptionService.createSubscription(CUSTOMER_ID, request);
        
        // Assert
        assertNotNull(result);
        assertEquals(SUBSCRIPTION_ID, result.getId());
        assertEquals(CUSTOMER_ID, result.getUserId());
        assertEquals(PLAN_ID, result.getPlanId());
        assertEquals(OPERATOR_ID, result.getOperatorId());
        assertEquals(SubscriptionStatus.PENDING, result.getStatus());
        assertEquals(autoRenewal, result.getAutoRenewal());
        
        verify(userRepository).findById(CUSTOMER_ID);
        verify(planRepository).findById(PLAN_ID);
        verify(subscriptionRepository).save(any(Subscription.class));
    }
    
    @ParameterizedTest(name = "User ID: {0}")
    @DisplayName("Should throw ResourceNotFoundException when user not found")
    @ValueSource(longs = {999L, 0L, -1L})
    public void testCreateSubscriptionUserNotFound(Long invalidUserId) {
        // Arrange
        SubscriptionCreateRequest request = SubscriptionCreateRequest.builder()
                .planId(PLAN_ID)
                .autoRenewal(true)
                .build();
        
        when(userRepository.findById(invalidUserId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                subscriptionService.createSubscription(invalidUserId, request)
        );
        
        verify(userRepository).findById(invalidUserId);
        verify(planRepository, never()).findById(anyLong());
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }
    
    @ParameterizedTest(name = "Plan ID: {0}")
    @DisplayName("Should throw ResourceNotFoundException when plan not found")
    @ValueSource(longs = {999L, 0L, -1L})
    public void testCreateSubscriptionPlanNotFound(Long invalidPlanId) {
        // Arrange
        SubscriptionCreateRequest request = SubscriptionCreateRequest.builder()
                .planId(invalidPlanId)
                .autoRenewal(true)
                .build();
        
        when(userRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(testCustomer));
        when(planRepository.findById(invalidPlanId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                subscriptionService.createSubscription(CUSTOMER_ID, request)
        );
        
        verify(userRepository).findById(CUSTOMER_ID);
        verify(planRepository).findById(invalidPlanId);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }
    
    // ============================================================================
    // GET SUBSCRIPTION TESTS
    // ============================================================================
    
    @ParameterizedTest(name = "Subscription ID: {0}")
    @DisplayName("Should get subscription by ID")
    @ValueSource(longs = {1L, 2L, 3L})
    public void testGetSubscriptionById(Long subscriptionId) {
        // Arrange
        testSubscription.setId(subscriptionId);
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(testSubscription));
        
        // Act
        SubscriptionResponseDTO result = subscriptionService.getSubscriptionById(subscriptionId);
        
        // Assert
        assertNotNull(result);
        assertEquals(subscriptionId, result.getId());
        assertEquals(CUSTOMER_ID, result.getUserId());
        assertEquals(PLAN_ID, result.getPlanId());
        
        verify(subscriptionRepository).findById(subscriptionId);
    }
    
    @ParameterizedTest(name = "Subscription ID: {0}")
    @DisplayName("Should throw ResourceNotFoundException when subscription not found")
    @ValueSource(longs = {999L, 0L, -1L})
    public void testGetSubscriptionByIdNotFound(Long invalidSubscriptionId) {
        // Arrange
        when(subscriptionRepository.findById(invalidSubscriptionId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                subscriptionService.getSubscriptionById(invalidSubscriptionId)
        );
        
        verify(subscriptionRepository).findById(invalidSubscriptionId);
    }
    
    // ============================================================================
    // GET USER SUBSCRIPTIONS TESTS
    // ============================================================================
    
    @ParameterizedTest(name = "Page: {0}, Size: {1}")
    @DisplayName("Should get user subscriptions with pagination")
    @CsvSource({
        "0, 10",
        "1, 20",
        "2, 5"
    })
    public void testGetUserSubscriptions(int pageNumber, int pageSize) {
        // Arrange
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<Subscription> subscriptionPage = new PageImpl<>(
                List.of(testSubscription),
                pageable,
                1
        );
        
        when(subscriptionRepository.findByUserId(CUSTOMER_ID, pageable))
                .thenReturn(subscriptionPage);
        
        // Act
        Page<SubscriptionResponseDTO> result = subscriptionService.getUserSubscriptions(CUSTOMER_ID, pageable);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getNumberOfElements());
        assertEquals(pageNumber, result.getNumber());
        assertEquals(pageSize, result.getSize());
        
        verify(subscriptionRepository).findByUserId(CUSTOMER_ID, pageable);
    }
    
    // ============================================================================
    // GET OPERATOR SUBSCRIPTIONS TESTS
    // ============================================================================
    
    @ParameterizedTest(name = "Page: {0}, Size: {1}")
    @DisplayName("Should get operator subscriptions with pagination")
    @CsvSource({
        "0, 10",
        "1, 20"
    })
    public void testGetOperatorSubscriptions(int pageNumber, int pageSize) {
        // Arrange
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<Subscription> subscriptionPage = new PageImpl<>(
                List.of(testSubscription),
                pageable,
                1
        );
        
        when(subscriptionRepository.findByOperatorId(OPERATOR_ID, pageable))
                .thenReturn(subscriptionPage);
        
        // Act
        Page<SubscriptionResponseDTO> result = subscriptionService.getOperatorSubscriptions(OPERATOR_ID, pageable);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getNumberOfElements());
        
        verify(subscriptionRepository).findByOperatorId(OPERATOR_ID, pageable);
    }
    
    // ============================================================================
    // GET OPERATOR PENDING SUBSCRIPTIONS TESTS
    // ============================================================================
    
    @ParameterizedTest(name = "Page: {0}, Size: {1}")
    @DisplayName("Should get operator pending subscriptions")
    @CsvSource({
        "0, 10",
        "1, 15"
    })
    public void testGetOperatorPendingSubscriptions(int pageNumber, int pageSize) {
        // Arrange
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<Subscription> subscriptionPage = new PageImpl<>(
                List.of(testSubscription),
                pageable,
                1
        );
        
        when(subscriptionRepository.findByOperatorIdAndStatus(OPERATOR_ID, SubscriptionStatus.PENDING, pageable))
                .thenReturn(subscriptionPage);
        
        // Act
        Page<SubscriptionResponseDTO> result = subscriptionService.getOperatorPendingSubscriptions(OPERATOR_ID, pageable);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getNumberOfElements());
        assertEquals(SubscriptionStatus.PENDING, result.getContent().get(0).getStatus());
        
        verify(subscriptionRepository).findByOperatorIdAndStatus(OPERATOR_ID, SubscriptionStatus.PENDING, pageable);
    }
    
    // ============================================================================
    // GET USER SUBSCRIPTIONS BY STATUS TESTS
    // ============================================================================
    
    @ParameterizedTest(name = "Status: {0}")
    @DisplayName("Should get user subscriptions by status")
    @EnumSource(SubscriptionStatus.class)
    public void testGetUserSubscriptionsByStatus(SubscriptionStatus status) {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Subscription subscription = Subscription.builder()
                .id(SUBSCRIPTION_ID)
                .user(testCustomer)
                .plan(testPlan)
                .operator(testOperator)
                .status(status)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
        
        Page<Subscription> subscriptionPage = new PageImpl<>(
                List.of(subscription),
                pageable,
                1
        );
        
        when(subscriptionRepository.findByUserIdAndStatus(CUSTOMER_ID, status, pageable))
                .thenReturn(subscriptionPage);
        
        // Act
        Page<SubscriptionResponseDTO> result = subscriptionService.getUserSubscriptionsByStatus(CUSTOMER_ID, status, pageable);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getNumberOfElements());
        assertEquals(status, result.getContent().get(0).getStatus());
        
        verify(subscriptionRepository).findByUserIdAndStatus(CUSTOMER_ID, status, pageable);
    }
    
    // ============================================================================
    // APPROVE SUBSCRIPTION TESTS
    // ============================================================================

    @ParameterizedTest(name = "Subscription ID: {0}")
    @DisplayName("Should approve subscription and change status to ACTIVE")
    @ValueSource(longs = {1L, 2L, 3L})
    public void testApproveSubscription(Long subscriptionId) {
        // Arrange
        testSubscription.setId(subscriptionId);
        testSubscription.setStatus(SubscriptionStatus.PENDING);
        
        Subscription approvedSubscription = Subscription.builder()
                .id(subscriptionId)
                .user(testCustomer)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(testSubscription.getCreatedAt())
                .endDate(testSubscription.getEndDate())
                .nextRenewalDate(testSubscription.getNextRenewalDate())
                .updatedAt(LocalDateTime.now())
                .build();
        
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(testSubscription));
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(approvedSubscription);
        
        // Act
        SubscriptionResponseDTO result = subscriptionService.approveSubscription(subscriptionId);
        
        // Assert
        assertNotNull(result);
        assertEquals(subscriptionId, result.getId());
        assertEquals(SubscriptionStatus.ACTIVE, result.getStatus());
        
        verify(subscriptionRepository).findById(subscriptionId);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @ParameterizedTest(name = "Subscription ID: {0}")
    @DisplayName("Should throw ResourceNotFoundException when approving non-existent subscription")
    @ValueSource(longs = {999L, 0L, -1L})
    public void testApproveSubscriptionNotFound(Long invalidSubscriptionId) {
        // Arrange
        when(subscriptionRepository.findById(invalidSubscriptionId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                subscriptionService.approveSubscription(invalidSubscriptionId)
        );
        
        verify(subscriptionRepository).findById(invalidSubscriptionId);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    // ============================================================================
    // SUSPEND SUBSCRIPTION TESTS
    // ============================================================================

    @ParameterizedTest(name = "Subscription ID: {0}")
    @DisplayName("Should suspend subscription and change status to SUSPENDED")
    @ValueSource(longs = {1L, 2L, 3L})
    public void testSuspendSubscription(Long subscriptionId) {
        // Arrange
        testSubscription.setId(subscriptionId);
        testSubscription.setStatus(SubscriptionStatus.ACTIVE);
        
        Subscription suspendedSubscription = Subscription.builder()
                .id(subscriptionId)
                .user(testCustomer)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.SUSPENDED)
                .autoRenewal(true)
                .createdAt(testSubscription.getCreatedAt())
                .endDate(testSubscription.getEndDate())
                .nextRenewalDate(testSubscription.getNextRenewalDate())
                .updatedAt(LocalDateTime.now())
                .build();
        
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(testSubscription));
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(suspendedSubscription);
        
        // Act
        SubscriptionResponseDTO result = subscriptionService.suspendSubscription(subscriptionId);
        
        // Assert
        assertNotNull(result);
        assertEquals(subscriptionId, result.getId());
        assertEquals(SubscriptionStatus.SUSPENDED, result.getStatus());
        
        verify(subscriptionRepository).findById(subscriptionId);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @ParameterizedTest(name = "Subscription ID: {0}")
    @DisplayName("Should throw ResourceNotFoundException when suspending non-existent subscription")
    @ValueSource(longs = {999L, 0L, -1L})
    public void testSuspendSubscriptionNotFound(Long invalidSubscriptionId) {
        // Arrange
        when(subscriptionRepository.findById(invalidSubscriptionId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                subscriptionService.suspendSubscription(invalidSubscriptionId)
        );
        
        verify(subscriptionRepository).findById(invalidSubscriptionId);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    // ============================================================================
    // CANCEL SUBSCRIPTION TESTS
    // ============================================================================

    @ParameterizedTest(name = "Reason: {0}")
    @DisplayName("Should cancel subscription with cancellation reason")
    @CsvSource({
        "Too expensive",
        "Not needed anymore",
        "Better service found",
        "' '"
    })
    public void testCancelSubscription(String cancellationReason) {
        // Arrange
        testSubscription.setStatus(SubscriptionStatus.ACTIVE);
        
        Subscription canceledSubscription = Subscription.builder()
                .id(SUBSCRIPTION_ID)
                .user(testCustomer)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.CANCELED)
                .autoRenewal(true)
                .createdAt(testSubscription.getCreatedAt())
                .endDate(testSubscription.getEndDate())
                .nextRenewalDate(testSubscription.getNextRenewalDate())
                .cancellationReason(cancellationReason.trim().isEmpty() ? null : cancellationReason.trim())
                .updatedAt(LocalDateTime.now())
                .build();
        
        when(subscriptionRepository.findById(SUBSCRIPTION_ID)).thenReturn(Optional.of(testSubscription));
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(canceledSubscription);
        
        // Act
        SubscriptionResponseDTO result = subscriptionService.cancelSubscription(SUBSCRIPTION_ID, cancellationReason.trim().isEmpty() ? null : cancellationReason.trim());
        
        // Assert
        assertNotNull(result);
        assertEquals(SUBSCRIPTION_ID, result.getId());
        assertEquals(SubscriptionStatus.CANCELED, result.getStatus());
        assertEquals(cancellationReason.trim().isEmpty() ? null : cancellationReason.trim(), result.getCancellationReason());
        
        verify(subscriptionRepository).findById(SUBSCRIPTION_ID);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @ParameterizedTest(name = "Subscription ID: {0}")
    @DisplayName("Should throw ResourceNotFoundException when canceling non-existent subscription")
    @ValueSource(longs = {999L, 0L, -1L})
    public void testCancelSubscriptionNotFound(Long invalidSubscriptionId) {
        // Arrange
        when(subscriptionRepository.findById(invalidSubscriptionId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                subscriptionService.cancelSubscription(invalidSubscriptionId, "Reason")
        );
        
        verify(subscriptionRepository).findById(invalidSubscriptionId);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }
}
        
