package com.bantads.auth.controller;

import com.bantads.auth.dto.LoginResponseDTO;
import com.bantads.auth.dto.LoginRequestDTO;
import com.bantads.auth.dto.LogoutResponseDTO;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;
import com.bantads.auth.service.LoginService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class AuthController {

    @Autowired
    private LoginService loginService; 

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        try {
            LoginResponseDTO response = loginService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).build(); 
        }
    }

    @PostMapping("/Logout")
    public ResponseEntity<LogoutResponseDTO> logout(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        // Retornamos null no nome pelo mesmo motivo da modelagem enxuta
        LogoutResponseDTO response = new LogoutResponseDTO(
                user.getReferenciaId(),
                null, 
                user.getEmail(),
                user.getTipo().name()
        );

        return ResponseEntity.ok(response);
    }
}