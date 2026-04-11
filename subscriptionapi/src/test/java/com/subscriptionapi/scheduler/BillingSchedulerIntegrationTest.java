package com.subscriptionapi.service;

import com.subscriptionapi.entity.*;
import com.subscriptionapi.repository.*;
import com.subscriptionapi.scheduler.*;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.params.provider.Arguments;
import static org.junit.jupiter.params.provider.Arguments.arguments;

/**
 * ============================================================================
 * BILLING SCHEDULER INTEGRATION TEST SUITE
 * ============================================================================
 * 
 * PURPOSE:
 * Tests recurring billing generation scheduler.
 * Verifies scheduler creates billings on correct billing day.
 * Ensures no duplicate billings are created.
 * 
 * SCHEDULER METHOD TESTED:
 * - generateRecurringBillings() (runs daily at 00:00)
 * 
 * KEY LOGIC:
 * - Billing day = day of month when subscription was created
 * - Only generates billing if today matches subscription creation day
 * - Prevents duplicates by checking existing billings in period
 * - Only processes ACTIVE subscriptions
 * 
 * DATA MODEL:
 * Multiple subscriptions created on different days of month
 * ============================================================================
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
@DisplayName("Billing Scheduler Integration Tests")
@Slf4j
public class BillingSchedulerIntegrationTest {

    @Autowired
    private BillingScheduler billingScheduler;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BillingRepository billingRepository;

    private User customer1;
    private User customer2;
    private User operator1;
    private User operator2;

    private Role customerRole;
    private Role operatorRole;

    private Plan plan1;
    private Plan plan2;
    private Plan plan3;

    private Subscription subscriptionDay15;
    private Subscription subscriptionDay20;
    private Subscription subscriptionCurrentDay;
    private Subscription subscriptionInactive;

    private static final String CUSTOMER1_EMAIL = "scheduler.customer1@example.com";
    private static final String CUSTOMER2_EMAIL = "scheduler.customer2@example.com";
    private static final String OPERATOR1_EMAIL = "scheduler.operator1@example.com";
    private static final String OPERATOR2_EMAIL = "scheduler.operator2@example.com";

    @BeforeEach
    void setUp() {
        billingRepository.deleteAll();
        subscriptionRepository.deleteAll();
        planRepository.deleteAll();
        userRepository.deleteAll();

        // Load roles
        customerRole = roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
        operatorRole = roleRepository.findByName(RoleType.OPERATOR)
            .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));

        // Create customers
        customer1 = User.builder()
                .email(CUSTOMER1_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        customer2 = User.builder()
                .email(CUSTOMER2_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Customer")
                .lastName("Two")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        userRepository.save(customer1);
        userRepository.save(customer2);

        // Create operators
        operator1 = User.builder()
                .email(OPERATOR1_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("One")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();

        operator2 = User.builder()
                .email(OPERATOR2_EMAIL)
                .password(passwordEncoder.encode("password123"))
                .firstName("Operator")
                .lastName("Two")
                .isActive(true)
                .roles(new HashSet<>(Set.of(operatorRole)))
                .build();

        userRepository.save(operator1);
        userRepository.save(operator2);

        // Create plans
        plan1 = Plan.builder()
                .user(operator1)
                .name("Plan 1 by Operator 1")
                .description("Test plan 1")
                .serviceType(ServiceType.INTERNET)
                .basePrice(BigDecimal.valueOf(99.99))
                .billingPeriod(BillingPeriod.MONTHLY)
                .status(PlanStatus.ACTIVE)
                .build();

        plan2 = Plan.builder()
                .user(operator1)
                .name("Plan 2 by Operator 1")
                .description("Test plan 2")
                .serviceType(ServiceType.BUNDLE)
                .basePrice(BigDecimal.valueOf(199.99))
                .billingPeriod(BillingPeriod.MONTHLY)
                .status(PlanStatus.ACTIVE)
                .build();

        plan3 = Plan.builder()
                .user(operator2)
                .name("Plan 3 by Operator 2")
                .description("Test plan 3")
                .serviceType(ServiceType.MOBILE)
                .basePrice(BigDecimal.valueOf(299.99))
                .billingPeriod(BillingPeriod.MONTHLY)
                .status(PlanStatus.ACTIVE)
                .build();

        planRepository.save(plan1);
        planRepository.save(plan2);
        planRepository.save(plan3);

        // Create subscriptions with specific creation dates
        // Subscription created on day 15 of previous month
        subscriptionDay15 = Subscription.builder()
                .user(customer1)
                .plan(plan1)
                .operator(operator1)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now().minusMonths(1).withDayOfMonth(15).withHour(10).withMinute(30))
                .endDate(LocalDateTime.now().plusMonths(1))
                .build();

        // Subscription created on day 20 of previous month
        subscriptionDay20 = Subscription.builder()
                .user(customer1)
                .plan(plan2)
                .operator(operator1)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now().minusMonths(1).withDayOfMonth(20).withHour(14).withMinute(45))
                .endDate(LocalDateTime.now().plusMonths(1))
                .build();

        // Subscription created on current day of month
        int currentDayOfMonth = LocalDateTime.now().getDayOfMonth();
        subscriptionCurrentDay = Subscription.builder()
                .user(customer2)
                .plan(plan3)
                .operator(operator2)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now().minusMonths(1).withDayOfMonth(currentDayOfMonth).withHour(9).withMinute(0))
                .endDate(LocalDateTime.now().plusMonths(1))
                .build();

        // Subscription with INACTIVE status (should NOT generate billing)
        subscriptionInactive = Subscription.builder()
                .user(customer2)
                .plan(plan1)
                .operator(operator1)
                .status(SubscriptionStatus.CANCELED)
                .autoRenewal(false)
                .createdAt(LocalDateTime.now().minusMonths(1).withDayOfMonth(currentDayOfMonth).withHour(12).withMinute(0))
                .endDate(LocalDateTime.now())
                .build();

        subscriptionRepository.save(subscriptionDay15);
        subscriptionRepository.save(subscriptionDay20);
        subscriptionRepository.save(subscriptionCurrentDay);
        subscriptionRepository.save(subscriptionInactive);
    }

    // ============================================================================
    // PARAMETERIZED TESTS FOR BILLING GENERATION
    // ============================================================================

    /**
     * SCENARIO: Scheduler generates billing only when subscription creation day matches today
     * 
     * Test data:
     * - subscriptionDay15: created on day 15, no billing today (today != 15)
     * - subscriptionDay20: created on day 20, no billing today (today != 20)
     * - subscriptionCurrentDay: created on current day, SHOULD generate billing
     * - subscriptionInactive: CANCELLED status, should NOT generate billing
     * 
     * Expected: Only 1 billing created (for subscriptionCurrentDay)
     */
    @Test
    @DisplayName("Scheduler generates billing only on matching billing day")
    void testGenerateRecurringBillings_OnlyOnMatchingBillingDay() throws Exception {
        // Act
        billingScheduler.generateRecurringBillings();

        // Assert
        int totalBillings = (int) billingRepository.count();
        assertThat(totalBillings, equalTo(1));

        List<Billing> billings = billingRepository.findBySubscriptionId(subscriptionCurrentDay.getId());
        assertThat(billings, hasSize(1));
        
        Billing billing = billings.get(0);
        assertThat(billing.getStatus(), equalTo(BillingStatus.PENDING));
        assertThat(billing.getAmount(), equalTo(plan3.getBasePrice()));
        
        log.info("✅ Billing generated for subscription created on current day of month");
    }

    /**
     * SCENARIO: Scheduler prevents duplicate billings for same subscription in same period
     * 
     * First call: generates billing for subscriptionCurrentDay
     * Second call: should NOT create duplicate billing
     * 
     * Expected: Still only 1 billing after second scheduler run
     */
    @Test
    @DisplayName("Scheduler prevents duplicate billing creation")
    void testGenerateRecurringBillings_NoDuplicates() throws Exception {
        // Act - First run
        billingScheduler.generateRecurringBillings();
        int billingsAfterFirst = (int) billingRepository.count();

        // Act - Second run
        billingScheduler.generateRecurringBillings();
        int billingsAfterSecond = (int) billingRepository.count();

        // Assert
        assertThat(billingsAfterFirst, equalTo(1));
        assertThat(billingsAfterSecond, equalTo(1)); // No duplicate created
        
        log.info("✅ Duplicate prevention working - only 1 billing exists after 2 scheduler runs");
    }

    /**
     * SCENARIO: Scheduler generates billings for all ACTIVE subscriptions matching billing day
     * 
     * Test data setup: Create 2 subscriptions on current day, 1 inactive
     * Expected: 2 billings generated (only for ACTIVE subscriptions)
     */
    @Test
    @DisplayName("Scheduler generates billings for all matching ACTIVE subscriptions")
    void testGenerateRecurringBillings_MultipleActiveSubscriptions() throws Exception {
        // Arrange - Create additional ACTIVE subscription on current day
        int currentDayOfMonth = LocalDateTime.now().getDayOfMonth();
        Subscription additionalActiveSubscription = Subscription.builder()
                .user(customer1)
                .plan(plan3)
                .operator(operator2)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now().minusMonths(1).withDayOfMonth(currentDayOfMonth).withHour(11).withMinute(15))
                .endDate(LocalDateTime.now().plusMonths(1))
                .build();
        subscriptionRepository.save(additionalActiveSubscription);

        // Act
        billingScheduler.generateRecurringBillings();

        // Assert
        int totalBillings = (int) billingRepository.count();
        assertThat(totalBillings, equalTo(2)); // Both ACTIVE subscriptions
        
        List<Billing> allBillings = billingRepository.findAll();
        allBillings.forEach(b -> assertThat(b.getStatus(), equalTo(BillingStatus.PENDING)));
        
        log.info("✅ Billings generated for all {} ACTIVE subscriptions", totalBillings);
    }

    /**
     * SCENARIO: Scheduler skips INACTIVE subscriptions (CANCELLED, PENDING, etc.)
     * 
     * Test data: subscriptionInactive with CANCELLED status created on current day
     * Expected: No billing generated for inactive subscription
     */
    @Test
    @DisplayName("Scheduler skips INACTIVE subscriptions")
    void testGenerateRecurringBillings_SkipsInactiveSubscriptions() throws Exception {
        // Arrange - All subscriptions on non-matching days except inactive one
        // subscriptionInactive is on current day but CANCELLED
        
        // Act
        billingScheduler.generateRecurringBillings();

        // Assert
        List<Billing> inactiveBillings = billingRepository.findBySubscriptionId(subscriptionInactive.getId());
        assertThat(inactiveBillings, hasSize(0)); // No billing created for inactive subscription
        
        int totalBillings = (int) billingRepository.count();
        assertThat(totalBillings, equalTo(1)); // Only subscriptionCurrentDay (ACTIVE) generated billing
        
        log.info("✅ Inactive subscriptions correctly skipped by scheduler");
    }

    /**
     * SCENARIO: Billing amount equals plan base price
     * 
     * Expected: Created billing.amount = subscription.plan.basePrice
     */
    @Test
    @DisplayName("Scheduler sets billing amount to plan base price")
    void testGenerateRecurringBillings_BillingAmountCorrect() throws Exception {
        // Act
        billingScheduler.generateRecurringBillings();

        // Assert
        List<Billing> billings = billingRepository.findBySubscriptionId(subscriptionCurrentDay.getId());
        assertThat(billings, hasSize(1));
        
        Billing billing = billings.get(0);
        assertThat(billing.getAmount(), equalTo(BigDecimal.valueOf(299.99)));
        assertThat(billing.getAmount(), equalTo(plan3.getBasePrice()));
        
        log.info("✅ Billing amount correctly set to plan base price: {}", billing.getAmount());
    }

    /**
     * SCENARIO: Billing due date is 15 days after billing date
     * 
     * Expected: dueDate = billingDate + 15 days
     */
    @Test
    @DisplayName("Scheduler sets due date to 15 days after billing date")
    void testGenerateRecurringBillings_DueDateCorrect() throws Exception {
        // Act
        billingScheduler.generateRecurringBillings();

        // Assert
        List<Billing> billings = billingRepository.findBySubscriptionId(subscriptionCurrentDay.getId());
        assertThat(billings, hasSize(1));
        
        Billing billing = billings.get(0);
        LocalDateTime expectedDueDate = billing.getBillingDate().plusDays(15);
        
        assertThat(billing.getDueDate(), equalTo(expectedDueDate));
        log.info("✅ Due date correctly set to {} (15 days after billing date)", billing.getDueDate());
    }

    /**
     * SCENARIO: Parameterized test for various subscription creation days
     * 
     * Tests that scheduler correctly identifies matching billing days
     * Only generates billing when subscription creation day == current day of month
     */
    @ParameterizedTest(name = "Subscription day {0}, current day {1}, expect billing: {2}")
    @MethodSource("provideBillingDayScenarios")
    @DisplayName("Scheduler billing day matching (parameterized)")
    void testGenerateRecurringBillings_BillingDayMatching(int subscriptionDay, int currentDayOfMonth, boolean shouldGenerateBilling) throws Exception {
        // Arrange
        int realCurrentDay = LocalDateTime.now().getDayOfMonth();
        
        Subscription testSubscription = Subscription.builder()
                .user(customer1)
                .plan(plan1)
                .operator(operator1)
                .status(SubscriptionStatus.ACTIVE)
                .autoRenewal(true)
                .createdAt(LocalDateTime.now().minusMonths(1).withDayOfMonth(subscriptionDay).withHour(10).withMinute(0))
                .endDate(LocalDateTime.now().plusMonths(1))
                .build();
        subscriptionRepository.save(testSubscription);

        // Act
        billingScheduler.generateRecurringBillings();

        // Assert
        List<Billing> billings = billingRepository.findBySubscriptionId(testSubscription.getId());
        
        if (shouldGenerateBilling) {
            assertThat(billings, hasSize(1));
            assertThat(billings.get(0).getStatus(), equalTo(BillingStatus.PENDING));
            log.info("✅ Billing generated for subscription created on day {} (matches current day {})", 
                subscriptionDay, realCurrentDay);
        } else {
            assertThat(billings, hasSize(0));
            log.info("✅ No billing generated - subscription day {} does not match current day {}", 
                subscriptionDay, realCurrentDay);
        }
    }

    // ============================================================================
    // PARAMETER SOURCE FOR PARAMETERIZED TESTS
    // ============================================================================

    /**
     * Provides billing day scenarios for parameterized test
     * 
     * Returns: subscription creation day, current day of month, should generate billing
     * 
     * Logic: Generate billing only if subscriptionDay == currentDayOfMonth
     */
    private Stream<Arguments> provideBillingDayScenarios() {
        int currentDay = LocalDateTime.now().getDayOfMonth();
        
        return Stream.of(
            // Subscription created on matching day - SHOULD generate billing
            arguments(currentDay, currentDay, true),
            
            // Subscription created on different days - should NOT generate billing
            arguments(currentDay - 1, currentDay, false),
            arguments(currentDay + 1, currentDay, false),
            arguments(15, currentDay, currentDay == 15),
            arguments(1, currentDay, currentDay == 1),
            arguments(28, currentDay, currentDay == 28)
        );
    }
}

