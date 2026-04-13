package com.subscriptionapi.config;

import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Order(3)
@RequiredArgsConstructor
@Profile("dev")
@EnableConfigurationProperties(UserProperties.class)
public class UserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProperties userProperties;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Initialize Customer Users
        initializeUsersByRole(userProperties.getCustomers(), RoleType.CUSTOMER);
        
        // Initialize Operator Users
        initializeUsersByRole(userProperties.getOperators(), RoleType.OPERATOR);
    }

    private void initializeUsersByRole(List<UserProperties.UserConfig> users, RoleType roleType) {
        if (users == null || users.isEmpty()) {
            return;
        }

        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException(roleType + " role not found"));

        for (UserProperties.UserConfig userConfig : users) {
            if (userRepository.findByEmail(userConfig.getEmail()).isEmpty()) {
                Set<Role> roles = new HashSet<>();
                roles.add(role);

                User user = User.builder()
                        .email(userConfig.getEmail())
                        .password(passwordEncoder.encode(userConfig.getPassword()))
                        .firstName(userConfig.getFirstName())
                        .lastName(userConfig.getLastName())
                        .isActive(true)
                        .roles(roles)
                        .build();

                userRepository.save(user);
            }
        }
    }
}
