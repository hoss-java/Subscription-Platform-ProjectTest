package com.subscriptionapi.config;

import com.subscriptionapi.entity.Role;
import com.subscriptionapi.entity.RoleType;
import com.subscriptionapi.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
public class RoleInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByName(roleType).isEmpty()) {
                Role role = Role.builder()
                        .name(roleType)
                        .description(getDescription(roleType))
                        .build();
                roleRepository.save(role);
            }
        }
    }

    private String getDescription(RoleType roleType) {
        return switch (roleType) {
            case CUSTOMER -> "Default customer role";
            case OPERATOR -> "Operator role with elevated permissions";
            case ADMIN -> "Administrator role with full access";
        };
    }
}
