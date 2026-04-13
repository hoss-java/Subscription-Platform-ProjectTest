package com.subscriptionapi.scheduler;

import com.subscriptionapi.entity.Billing;
import com.subscriptionapi.entity.BillingStatus;
import com.subscriptionapi.entity.Subscription;
import com.subscriptionapi.entity.SubscriptionStatus;
import com.subscriptionapi.repository.BillingRepository;
import com.subscriptionapi.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final BillingRepository billingRepository;

    /**
     * Runs daily at 00:00 to generate recurring billings for active subscriptions
     * Checks if subscription billing day matches today
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void generateRecurringBillings() {
        log.info("Starting recurring billing generation scheduler");
        
        try {
            List<Subscription> activeSubscriptions = subscriptionRepository
                    .findByStatus(SubscriptionStatus.ACTIVE);
            
            int billingsCreated = 0;
            
            for (Subscription subscription : activeSubscriptions) {
                if (shouldGenerateBilling(subscription)) {
                    boolean created = createBillingIfNotExists(subscription);
                    if (created) {
                        billingsCreated++;
                    }
                }
            }
            
            log.info("Recurring billing generation completed. {} billings created", billingsCreated);
        } catch (Exception e) {
            log.error("Error during recurring billing generation", e);
        }
    }

    /**
     * Checks if today is the billing day for the subscription
     * Billing day = day of month when subscription was created
     */
    private boolean shouldGenerateBilling(Subscription subscription) {
        LocalDateTime now = LocalDateTime.now();
        int subscriptionDayOfMonth = subscription.getCreatedAt().getDayOfMonth();
        int currentDayOfMonth = now.getDayOfMonth();
        
        return subscriptionDayOfMonth == currentDayOfMonth;
    }

    /**
     * Creates billing if it doesn't already exist for this subscription and billing period
     * Prevents duplicate billings
     */
    private boolean createBillingIfNotExists(Subscription subscription) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime periodStart = LocalDateTime.of(
                now.getYear(), 
                now.getMonth(), 
                subscription.getCreatedAt().getDayOfMonth(), 
                0, 0, 0
        );
        LocalDateTime periodEnd = periodStart.plusMonths(1).minusDays(1).withHour(23).withMinute(59).withSecond(59);
        
        // Check if billing already exists for this subscription and period
        boolean billingExists = billingRepository
                .findBySubscriptionIdAndBillingDateBetween(subscription.getId(), periodStart, periodEnd)
                .isPresent();
        
        if (billingExists) {
            log.debug("Billing already exists for subscription ID: {} for period {}", 
                    subscription.getId(), periodStart);
            return false;
        }
        
        // Create new billing
        LocalDateTime dueDate = now.plusDays(15); // Due 15 days after billing date
        
        Billing billing = Billing.builder()
                .subscription(subscription)
                .amount(subscription.getPlan().getBasePrice())
                .billingDate(now)
                .dueDate(dueDate)
                .status(BillingStatus.PENDING)
                .build();
        
        billingRepository.save(billing);
        log.info("Billing created for subscription ID: {} with amount: {}", 
                subscription.getId(), billing.getAmount());
        
        return true;
    }
}
