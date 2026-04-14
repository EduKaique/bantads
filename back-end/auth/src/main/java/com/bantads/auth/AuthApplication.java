package com.bantads.auth;

import com.bantads.auth.model.User;
import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

    // Utilizador de teste ao iniciar a aplicação
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@bantads.com").isEmpty()) {
                User testUser = new User();
                testUser.setEmail("admin@bantads.com");
                testUser.setSenha(passwordEncoder.encode("123456"));
                testUser.setTipo(TipoUsuario.ADMIN);
                testUser.setReferenciaId("12345678900");

                userRepository.save(testUser);
                System.out.println("Utilizador de teste criado com sucesso!");
            }
        };
    }
}