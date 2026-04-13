package com.subscriptionapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SubscriptionApiApp {
    public static void main(String[] args) {
        SpringApplication.run(SubscriptionApiApp.class, args);
    }
}
