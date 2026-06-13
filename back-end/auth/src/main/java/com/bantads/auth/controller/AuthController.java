package com.bantads.auth.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bantads.auth.dto.LoginRequestDTO;
import com.bantads.auth.dto.LoginResponseDTO;
import com.bantads.auth.dto.LogoutResponseDTO;
import com.bantads.auth.model.TokenBlacklist;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.TokenBlacklistRepository;
import com.bantads.auth.repository.UserRepository;
import com.bantads.auth.service.LoginService;
import com.bantads.auth.service.SeedService;

import jakarta.validation.Valid;

@RestController
@RequestMapping
public class AuthController {

    @Autowired
    private LoginService loginService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeedService seedService;

    @Autowired
    private TokenBlacklistRepository blacklistRepository;

    @GetMapping("/reboot")
    public ResponseEntity<Void> reboot() {
        userRepository.deleteAll();
        seedService.seed();
        blacklistRepository.deleteAll(); 
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        try {
            LoginResponseDTO response = loginService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).build(); 
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponseDTO> logout(Authentication authentication, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            blacklistRepository.save(new TokenBlacklist(token));
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        LogoutResponseDTO response = new LogoutResponseDTO(
                user.getReferenciaId(),
                user.getNome(),
                user.getEmail(),
                user.getTipo().name()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        return ResponseEntity.ok().build();
    }
}