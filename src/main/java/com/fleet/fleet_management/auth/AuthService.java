
package com.fleet.fleet_management.auth;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    @Value("${app.admin.password}")
    private String defaultAdminPassword;

    public AuthService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, Object> login(String email, String password) {
        AppUser user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()
                || !passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return Map.of(
                "message", "Login successful",
                "token", UUID.randomUUID().toString(),
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }

    public void createDefaultAdmin() {
        String email = "admin@fleetiq.com";

        if (userRepository.findByEmailIgnoreCase(email).isEmpty()) {
            AppUser admin = new AppUser();
            admin.setEmail(email);
            admin.setPassword(
                    passwordEncoder.encode(defaultAdminPassword));
            admin.setRole("ADMIN");
            admin.setActive(true);
            userRepository.save(admin);
        }
    }
}
