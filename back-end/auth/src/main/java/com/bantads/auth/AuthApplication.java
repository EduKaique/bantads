package com.bantads.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;

@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }
    // Utilizador de teste ao iniciar a aplicação
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String senhaPadrao = "tads";

            createUserIfNotFound(userRepository, passwordEncoder, 
                "cli1@bantads.com.br", senhaPadrao, TipoUsuario.CLIENTE, "Catharyna", "12912861012");
                
            createUserIfNotFound(userRepository, passwordEncoder, 
                "cli2@bantads.com.br", senhaPadrao, TipoUsuario.CLIENTE, "Cleuddônio", "09506382000");
                
            createUserIfNotFound(userRepository, passwordEncoder, 
                "cli3@bantads.com.br", senhaPadrao, TipoUsuario.CLIENTE, "Catianna", "85733854057");
                
            createUserIfNotFound(userRepository, passwordEncoder, 
                "cli4@bantads.com.br", senhaPadrao, TipoUsuario.CLIENTE, "Cutardo", "58872160006");
                
            createUserIfNotFound(userRepository, passwordEncoder, 
                "cli5@bantads.com.br", senhaPadrao, TipoUsuario.CLIENTE, "Coândrya", "76179646090");

            createUserIfNotFound(userRepository, passwordEncoder, 
                "ger1@bantads.com.br", senhaPadrao, TipoUsuario.GERENTE, "Geniéve", "98574307084");
                
            createUserIfNotFound(userRepository, passwordEncoder, 
                "ger2@bantads.com.br", senhaPadrao, TipoUsuario.GERENTE, "Godophredo", "64065268052");
                
            createUserIfNotFound(userRepository, passwordEncoder, 
                "ger3@bantads.com.br", senhaPadrao, TipoUsuario.GERENTE, "Gyândula", "23862179060");

            createUserIfNotFound(userRepository, passwordEncoder, 
                "adm1@bantads.com.br", senhaPadrao, TipoUsuario.ADMIN, "Adamântio", "40501740066");

            System.out.println("Base de dados de autenticação populada com sucesso!");
        };
    }

    // Método auxiliar para não repetir código
    private void createUserIfNotFound(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                                      String email, String senhaRaw, TipoUsuario tipo, String nome, String cpf) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setSenha(passwordEncoder.encode(senhaRaw));
            newUser.setTipo(tipo);
            newUser.setNome(nome);
            newUser.setReferenciaId(cpf);
            userRepository.save(newUser);
        }
    }
}