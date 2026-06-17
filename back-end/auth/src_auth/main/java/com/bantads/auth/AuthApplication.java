package com.bantads.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.bantads.auth.repository.UserRepository;
import com.bantads.auth.service.SeedService;

@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, SeedService seedService) {
        return args -> {
            if (userRepository.count() == 0) {
                seedService.seed();
                System.out.println("Base de dados de autenticação populada com sucesso!");
            }
        };
    }
}