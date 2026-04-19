package com.subscriptionapi.config;

import com.subscriptionapi.entity.Plan;
import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.entity.ServiceType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.entity.PlanStatus;

import com.subscriptionapi.repository.PlanRepository;
import com.subscriptionapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

@Component
@Order(4)
@RequiredArgsConstructor
@Profile("dev")
@EnableConfigurationProperties(PlanProperties.class)
public class PlanInitializer implements ApplicationRunner {

    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    private final PlanProperties planProperties;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (planProperties.getOperators() == null || planProperties.getOperators().isEmpty()) {
            return;
        }

        for (PlanProperties.OperatorPlan operatorPlan : planProperties.getOperators()) {
            User operator = userRepository.findByEmail(operatorPlan.getOperatorEmail())
                    .orElseThrow(() -> new RuntimeException("Operator not found: " + operatorPlan.getOperatorEmail()));

            if (operatorPlan.getPlans() == null || operatorPlan.getPlans().isEmpty()) {
                continue;
            }

            for (PlanProperties.PlanConfig planConfig : operatorPlan.getPlans()) {
                // Check if plan already exists
                if (planRepository.findByNameAndUser(planConfig.getName(), operator).isEmpty()) {
                    Plan plan = Plan.builder()
                            .user(operator)
                            .name(planConfig.getName())
                            .description(planConfig.getDescription())
                            .serviceType(ServiceType.valueOf(planConfig.getServiceType()))
                            .basePrice(planConfig.getBasePrice())
                            .billingPeriod(BillingPeriod.valueOf(planConfig.getBillingPeriod()))
                            .features(planConfig.getFeatures())
                            .status(PlanStatus.ACTIVE)  // Plans are created as ACTIVE by default
                            .build();

                    planRepository.save(plan);
                }
            }
        }
    }
}
