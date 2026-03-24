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
@Order(3)
@RequiredArgsConstructor
@Profile("test | dev")
public class CustomerInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${customer.email:customer@example.com}")
    private String customerEmail;

    @Value("${customer.password:Customer123!}")
    private String customerPassword;

    @Value("${customer.firstName:Test}")
    private String customerFirstName;

    @Value("${customer.lastName:Customer}")
    private String customerLastName;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRepository.findByEmail(customerEmail).isEmpty()) {
            Role customerRole = roleRepository.findByName(RoleType.CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
            
            Set<Role> roles = new HashSet<>();
            roles.add(customerRole);
            
            User customer = User.builder()
                    .email(customerEmail)
                    .password(passwordEncoder.encode(customerPassword))
                    .firstName(customerFirstName)
                    .lastName(customerLastName)
                    .isActive(true)
                    .roles(roles)
                    .build();
            
            userRepository.save(customer);
        }
    }
}
