package com.subscriptionapi.config;

import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.entity.User;
import com.subscriptionapi.repository.RoleRepository;
import com.subscriptionapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.util.HashSet;
import java.util.Set;

@Component
@Order(2)
@RequiredArgsConstructor
@Profile("!dev")
public class AdminInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${admin.password:Admin123!}")
    private String adminPassword;

    @Value("${admin.firstName:System}")
    private String adminFirstName;

    @Value("${admin.lastName:Admin}")
    private String adminLastName;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
            
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .firstName(adminFirstName)
                    .lastName(adminLastName)
                    .isActive(true)
                    .roles(roles)
                    .build();
            
            userRepository.save(admin);
        }
    }
}

