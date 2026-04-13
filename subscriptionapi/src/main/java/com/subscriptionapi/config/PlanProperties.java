package com.subscriptionapi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "plans")
public class PlanProperties {
    private List<OperatorPlan> operators = new ArrayList<>();

    @Data
    public static class OperatorPlan {
        private String operatorEmail;
        private List<PlanConfig> plans = new ArrayList<>();
    }

    @Data
    public static class PlanConfig {
        private String name;
        private String description;
        private String serviceType;
        private BigDecimal basePrice;
        private String billingPeriod;
        private String features;
    }
}
