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
@Order(4)
@RequiredArgsConstructor
@Profile("dev")
public class OperatorInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${operator.email:operator@example.com}")
    private String operatorEmail;

    @Value("${operator.password:Operator123!}")
    private String operatorPassword;

    @Value("${operator.firstName:Test}")
    private String operatorFirstName;

    @Value("${operator.lastName:Operator}")
    private String operatorLastName;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRepository.findByEmail(operatorEmail).isEmpty()) {
            Role operatorRole = roleRepository.findByName(RoleType.OPERATOR)
                    .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));
            
            Set<Role> roles = new HashSet<>();
            roles.add(operatorRole);
            
            User operator = User.builder()
                    .email(operatorEmail)
                    .password(passwordEncoder.encode(operatorPassword))
                    .firstName(operatorFirstName)
                    .lastName(operatorLastName)
                    .isActive(true)
                    .roles(roles)
                    .build();
            
            userRepository.save(operator);
        }
    }
}
