package com.advsoft.workbench.config;

import com.advsoft.workbench.model.Role;
import com.advsoft.workbench.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class StartupDataSeeder {

    @Bean
    ApplicationRunner seedDefaultRoles(RoleRepository roleRepository) {
        return args -> {
            seedRoleIfMissing(roleRepository, "USER", "Default application user");
            seedRoleIfMissing(roleRepository, "ADMIN", "Application administrator");
            seedRoleIfMissing(roleRepository, "MODERATOR", "Application moderator");
        };
    }

    private void seedRoleIfMissing(RoleRepository roleRepository, String name, String description) {
        roleRepository.findByName(name).orElseGet(() -> roleRepository.save(
                Role.builder()
                        .name(name)
                        .description(description)
                        .build()
        ));
    }
}