package com.subscriptionapi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "users")
public class UserProperties {
    private List<UserConfig> admins = new ArrayList<>();
    private List<UserConfig> customers = new ArrayList<>();
    private List<UserConfig> operators = new ArrayList<>();

    @Data
    public static class UserConfig {
        private String email;
        private String password;
        private String firstName;
        private String lastName;
    }
}
