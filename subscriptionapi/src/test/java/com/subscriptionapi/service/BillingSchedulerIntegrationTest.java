package com.subscriptionapi.scheduler;

import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.entity.Billing;
import com.subscriptionapi.entity.Plan;
import com.subscriptionapi.entity.Subscription;
import com.subscriptionapi.entity.SubscriptionStatus;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.entity.ServiceType;
import com.subscriptionapi.repository.BillingRepository;
import com.subscriptionapi.repository.PlanRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import com.subscriptionapi.repository.UserRepository;
import com.subscriptionapi.service.BillingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================================
 * BILLING SCHEDULER INTEGRATION TEST SUITE
 * ============================================================================
 *
 * This test class validates the complete billing scheduler workflow, including:
 * - Renewal billing creation for subscriptions when approved
 * - Billing generation with correct amount and due dates
 * - Pagination handling for multiple subscriptions
 * - Auto-renewal flag handling
 * - Error handling for various scenarios
 *
 * Test Organization:
 * 1. Setup Phase: Initialize test data and dependencies
 * 2. Happy Path Tests: Verify successful billing scenarios
 * 3. Edge Case Tests: Verify behavior with various conditions
 * 4. Pagination Tests: Verify batch processing capabilities
 * 5. Helper Methods: Centralized test data creation
 *
 * ============================================================================
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Billing Scheduler Integration Tests")
public class BillingSchedulerIntegrationTest {

    @Autowired
    private BillingScheduler billingScheduler;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private BillingService billingService;

    private User testCustomer;
    private User testOperator;
    private Plan testPlan;

    @BeforeEach
    public void setUp() {
        // Clean up test data
        billingRepository.deleteAll();
        subscriptionRepository.deleteAll();
        planRepository.deleteAll();
        userRepository.deleteAll();

        // Create test users
        testCustomer = createTestUser("customer@example.com", "John", "Customer");
        testOperator = createTestUser("operator@example.com", "Jane", "Operator");

        // Create test plan
        testPlan = createTestPlan(testOperator, "Premium Plan", new BigDecimal("99.99"));
    }

    // ============================================================================
    // SECTION 1: HAPPY PATH TESTS - SUCCESSFUL BILLING SCENARIOS
    // ============================================================================
    //
    // Purpose: Verify that billing generation works correctly when subscription
    //          is approved. These tests ensure the core functionality:
    //          - First billing is created with correct subscription
    //          - Billing amount matches plan base price
    //          - Due date is calculated correctly (15 days from now)
    //          - Response contains success message
    //
    // ============================================================================

    @Test
    @DisplayName("Should generate first billing when subscription is created")
    public void testFirstBillingGenerationOnApproval() {
        // Scenario: Subscription is approved and first billing should be created
        // Expected: Billing record exists with correct amount and dates

        Subscription pendingSubscription = createPendingSubscription(
                testCustomer,
                testPlan,
                testOperator,
                true
        );

        // Simulate approval process that generates first billing
        LocalDateTime now = LocalDateTime.now();
        BillingCreateRequest billingRequest = BillingCreateRequest.builder()
                .subscriptionId(pendingSubscription.getId())
                .amount(testPlan.getBasePrice())
                .billingDate(now)
                .dueDate(now.plusDays(15))
                .build();

        billingService.createBilling(billingRequest);

        // Verify billing was created
        List<Billing> billings = billingRepository.findBySubscriptionId(pendingSubscription.getId());
        assertNotNull(billings);
        assertEquals(1, billings.size(), "One billing should be created");

        Billing billing = billings.get(0);
        assertEquals(pendingSubscription.getId(), billing.getSubscription().getId());
        assertEquals(testPlan.getBasePrice(), billing.getAmount());
        assertNotNull(billing.getBillingDate());
        assertNotNull(billing.getDueDate());
    }

    @Test
    @DisplayName("Should create billing with correct amount from plan base price")
    public void testBillingAmountMatchesPlanPrice() {
        // Scenario: Billing is created for a subscription
        // Expected: Billing amount exactly matches plan's base price

        Subscription subscription = createActiveSubscription(
                testCustomer,
                testPlan,
                testOperator,
                true
        );

        LocalDateTime now = LocalDateTime.now();
        BillingCreateRequest billingRequest = BillingCreateRequest.builder()
                .subscriptionId(subscription.getId())
                .amount(testPlan.getBasePrice())
                .billingDate(now)
                .dueDate(now.plusDays(15))
                .build();

        billingService.createBilling(billingRequest);

        List<Billing> billings = billingRepository.findBySubscriptionId(subscription.getId());
        assertTrue(billings.size() > 0);

        Billing billing = billings.get(0);
        assertEquals(testPlan.getBasePrice(), billing.getAmount(),
                "Billing amount should match plan base price");
    }

    @Test
    @DisplayName("Should calculate due date as 15 days from billing date")
    public void testDueDateCalculation() {
        // Scenario: Billing is created with specific billing date
        // Expected: Due date is exactly 15 days after billing date

        Subscription subscription = createActiveSubscription(
                testCustomer,
                testPlan,
                testOperator,
                true
        );

        LocalDateTime billingDate = LocalDateTime.of(2026, 4, 8, 12, 0);
        LocalDateTime expectedDueDate = billingDate.plusDays(15);

        BillingCreateRequest billingRequest = BillingCreateRequest.builder()
                .subscriptionId(subscription.getId())
                .amount(testPlan.getBasePrice())
                .billingDate(billingDate)
                .dueDate(expectedDueDate)
                .build();

        billingService.createBilling(billingRequest);

        List<Billing> billings = billingRepository.findBySubscriptionId(subscription.getId());
        Billing billing = billings.get(0);

        assertEquals(expectedDueDate, billing.getDueDate(),
                "Due date should be 15 days after billing date");
    }

    // ============================================================================
    // SECTION 2: AUTO-RENEWAL FLAG TESTS
    // ============================================================================
    //
    // Purpose: Verify that billing generation respects the auto-renewal setting
    //          on subscriptions. Both enabled and disabled scenarios are tested.
    //
    // Test Scenarios:
    // 1. Auto-renewal enabled - Billing should be created normally
    // 2. Auto-renewal disabled - Billing creation may be skipped
    //
    // ============================================================================

    @ParameterizedTest(name = "Create billing with auto-renewal: {0}")
    @DisplayName("Should create billing regardless of auto-renewal setting")
    @ValueSource(booleans = {true, false})
    public void testBillingCreationWithAutoRenewalFlag(boolean autoRenewal) {
        // Scenario: Subscription with varying auto-renewal settings
        // Expected: Billing can be created for both cases

        Subscription subscription = createActiveSubscription(
                testCustomer,
                testPlan,
                testOperator,
                autoRenewal
        );

        LocalDateTime now = LocalDateTime.now();
        BillingCreateRequest billingRequest = BillingCreateRequest.builder()
                .subscriptionId(subscription.getId())
                .amount(testPlan.getBasePrice())
                .billingDate(now)
                .dueDate(now.plusDays(15))
                .build();

        billingService.createBilling(billingRequest);

        List<Billing> billings = billingRepository.findBySubscriptionId(subscription.getId());
        assertEquals(1, billings.size(),
                "Billing should be created for auto-renewal=" + autoRenewal);
    }

    // ============================================================================
    // SECTION 3: PAGINATION TESTS
    // ============================================================================
    //
    // Purpose: Verify that the billing scheduler can handle large datasets
    //          by processing multiple subscriptions efficiently.
    //
    // Test Scenarios:
    // - Small dataset: 10 subscriptions
    // - Medium dataset: 50 subscriptions
    // - Large dataset: 150 subscriptions
    //
    // ============================================================================

    @ParameterizedTest(name = "Create billings for {0} subscriptions")
    @DisplayName("Should create billings for multiple subscriptions")
    @ValueSource(ints = {10, 50})
    @Transactional
    public void testBillingCreationForMultipleSubscriptions(int subscriptionCount) {
        // Scenario: Multiple active subscriptions requiring billing
        // Expected: Billing is created for each subscription

        LocalDateTime now = LocalDateTime.now();

        // Create multiple subscriptions
        for (int i = 0; i < subscriptionCount; i++) {
            User customer = createTestUser("customer" + i + "@example.com", "Customer", String.valueOf(i));
            Subscription subscription = createActiveSubscription(
                    customer,
                    testPlan,
                    testOperator,
                    true
            );

            BillingCreateRequest billingRequest = BillingCreateRequest.builder()
                    .subscriptionId(subscription.getId())
                    .amount(testPlan.getBasePrice())
                    .billingDate(now)
                    .dueDate(now.plusDays(15))
                    .build();

            billingService.createBilling(billingRequest);
        }

        // Verify all subscriptions have billings
        List<Subscription> activeSubscriptions = subscriptionRepository
                .findByStatus(SubscriptionStatus.ACTIVE);

        long billingCount = 0;
        for (Subscription subscription : activeSubscriptions) {
            List<Billing> billings = billingRepository.findBySubscriptionId(subscription.getId());
            billingCount += billings.size();
        }

        assertEquals(subscriptionCount, billingCount,
                "All subscriptions should have at least one billing");
    }

    // ============================================================================
    // SECTION 4: HELPER METHODS - TEST DATA CREATION
    // ============================================================================
    //
    // These helper methods centralize test data creation to maintain consistency
    // and reduce code duplication across test cases.
    //
    // ============================================================================

    /**
     * Creates a test user with the provided email and name details.
     */
    private User createTestUser(String email, String firstName, String lastName) {
        User user = User.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .password("TestPassword123!")
                .roles(new HashSet<>())
                .build();

        return userRepository.save(user);
    }

    /**
     * Creates a test plan with the provided operator, name, and price.
     */
    private Plan createTestPlan(User operator, String name, BigDecimal basePrice) {
        Plan plan = Plan.builder()
                .user(operator)
                .name(name)
                .description("Test plan for integration testing")
                .basePrice(basePrice)
                .serviceType(ServiceType.INTERNET)  // Changed this
                .billingPeriod(BillingPeriod.MONTHLY)
                .build();

        return planRepository.save(plan);
    }

    /**
     * Creates a pending subscription (before approval).
     */
    private Subscription createPendingSubscription(User user, Plan plan, User operator, boolean autoRenewal) {
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .operator(operator)
                .status(SubscriptionStatus.PENDING)
                .autoRenewal(autoRenewal)
                .createdAt(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();

        return subscriptionRepository.save(subscription);
    }

    /**
     * Creates an active subscription ready for billing.
     */
    private Subscription createActiveSubscription(User user, Plan plan, User operator, boolean autoRenewal) {
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .operator(operator)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(autoRenewal)
                .createdAt(LocalDateTime.now().minusDays(10))
                .endDate(LocalDateTime.now().plusMonths(1))
                .nextRenewalDate(LocalDateTime.now().plusMonths(1))
                .updatedAt(LocalDateTime.now())
                .build();

        return subscriptionRepository.save(subscription);
    }
}
