package com.subscriptionapi.service;

import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.dto.BillingUpdateRequest;
import com.subscriptionapi.entity.*;
import com.subscriptionapi.exception.ResourceNotFoundException;
import com.subscriptionapi.repository.BillingRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@Slf4j
@ExtendWith(MockitoExtension.class)
@DisplayName("Billing Service Unit Tests (Mocked)")
public class BillingServiceUnitTest {
    
    @Mock
    private BillingRepository billingRepository;
    
    @Mock
    private SubscriptionRepository subscriptionRepository;
    
    @InjectMocks
    private BillingServiceImpl billingService;
    
    private User testCustomer;
    private User testOperator;
    private Plan testPlan;
    private Subscription testSubscription;
    private Billing testBilling;
    private Role customerRole;
    private Role operatorRole;
    
    private static final Long CUSTOMER_ID = 1L;
    private static final Long OPERATOR_ID = 2L;
    private static final Long PLAN_ID = 1L;
    private static final Long SUBSCRIPTION_ID = 1L;
    private static final Long BILLING_ID = 1L;
    private static final String CUSTOMER_EMAIL = "customer@example.com";
    private static final String OPERATOR_EMAIL = "operator@example.com";
    private static final BigDecimal BILLING_AMOUNT = BigDecimal.valueOf(99.99);
    
    @BeforeEach
    public void setUp() {
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
        
        testPlan = Plan.builder()
                .id(PLAN_ID)
                .user(testOperator)
                .name("Premium Plan")
                .description("Premium subscription plan")
                .serviceType(ServiceType.INTERNET)
                .basePrice(BILLING_AMOUNT)
                .billingPeriod(BillingPeriod.MONTHLY)
                .features("Feature 1, Feature 2")
                .status(PlanStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        testSubscription = Subscription.builder()
                .id(SUBSCRIPTION_ID)
                .user(testCustomer)
                .plan(testPlan)
                .operator(testOperator)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();
        
        testBilling = Billing.builder()
                .id(BILLING_ID)
                .subscription(testSubscription)
                .amount(BILLING_AMOUNT)
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .status(BillingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
    
    @DisplayName("Should create billing with valid request")
    @org.junit.jupiter.api.Test
    public void testCreateBilling() {
        BillingCreateRequest request = BillingCreateRequest.builder()
                .subscriptionId(SUBSCRIPTION_ID)
                .amount(BILLING_AMOUNT)
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();
        
        when(subscriptionRepository.findById(SUBSCRIPTION_ID)).thenReturn(Optional.of(testSubscription));
        when(billingRepository.save(any(Billing.class))).thenReturn(testBilling);
        
        BillingResponseDTO result = billingService.createBilling(request);
        
        assertNotNull(result);
        assertEquals(BILLING_ID, result.getId());
        assertEquals(SUBSCRIPTION_ID, result.getSubscriptionId());
        assertEquals(BILLING_AMOUNT, result.getAmount());
        assertEquals(BillingStatus.PENDING, result.getStatus());
        
        verify(subscriptionRepository).findById(SUBSCRIPTION_ID);
        verify(billingRepository).save(any(Billing.class));
    }
    
    @DisplayName("Should throw exception when subscription not found")
    @org.junit.jupiter.api.Test
    public void testCreateBillingSubscriptionNotFound() {
        BillingCreateRequest request = BillingCreateRequest.builder()
                .subscriptionId(999L)
                .amount(BILLING_AMOUNT)
                .billingDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();
        
        when(subscriptionRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> billingService.createBilling(request));
        verify(subscriptionRepository).findById(999L);
        verify(billingRepository, never()).save(any());
    }
    
    @ParameterizedTest(name = "Status: {0}")
    @DisplayName("Should update billing status")
    @EnumSource(value = BillingStatus.class)
    public void testUpdateBillingStatus(BillingStatus newStatus) {
        Billing updatedBilling = testBilling;
        updatedBilling.setStatus(newStatus);
        if (newStatus == BillingStatus.PAID) {
            updatedBilling.setPaidDate(LocalDateTime.now());
        }
        
        when(billingRepository.findById(BILLING_ID)).thenReturn(Optional.of(testBilling));
        when(billingRepository.save(any(Billing.class))).thenReturn(updatedBilling);
        
        BillingResponseDTO result = billingService.updateBillingStatus(BILLING_ID, newStatus, testBilling.getSubscription().getUser().getId());
        
        assertNotNull(result);
        assertEquals(newStatus, result.getStatus());
        if (newStatus == BillingStatus.PAID) {
            assertNotNull(result.getPaidDate());
        }
        
        verify(billingRepository).findById(BILLING_ID);
        verify(billingRepository).save(any(Billing.class));
    }

    @DisplayName("Should get billing by ID")
    @org.junit.jupiter.api.Test
    public void testGetBillingById() {
        when(billingRepository.findById(BILLING_ID)).thenReturn(Optional.of(testBilling));
        
        BillingResponseDTO result = billingService.getBillingById(BILLING_ID);
        
        assertNotNull(result);
        assertEquals(BILLING_ID, result.getId());
        assertEquals(SUBSCRIPTION_ID, result.getSubscriptionId());
        
        verify(billingRepository).findById(BILLING_ID);
    }
    
    @DisplayName("Should throw exception when billing not found")
    @org.junit.jupiter.api.Test
    public void testGetBillingByIdNotFound() {
        when(billingRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> billingService.getBillingById(999L));
        verify(billingRepository).findById(999L);
    }
    
    @DisplayName("Should get billings by user")
    @org.junit.jupiter.api.Test
    public void testGetBillingsByUser() {
        List<Billing> billings = Arrays.asList(testBilling);
        when(billingRepository.findBySubscriptionUserIdOrderByBillingDateDesc(CUSTOMER_ID))
                .thenReturn(billings);
        
        List<BillingResponseDTO> result = billingService.getBillingsByUser(CUSTOMER_ID);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(BILLING_ID, result.get(0).getId());
        
        verify(billingRepository).findBySubscriptionUserIdOrderByBillingDateDesc(CUSTOMER_ID);
    }
    
    @DisplayName("Should delete billing")
    @org.junit.jupiter.api.Test
    public void testDeleteBilling() {
        when(billingRepository.findById(BILLING_ID)).thenReturn(Optional.of(testBilling));
        
        billingService.deleteBilling(BILLING_ID, testCustomer.getId());
        
        verify(billingRepository).findById(BILLING_ID);
        verify(billingRepository).delete(testBilling);
    }
}
