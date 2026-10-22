package com.fleet.fleet_management.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthDataInitializer {
    @Bean
    CommandLineRunner initializeDefaultAdmin(AuthService authService) {
        return args -> authService.createDefaultAdmin();
    }
}
