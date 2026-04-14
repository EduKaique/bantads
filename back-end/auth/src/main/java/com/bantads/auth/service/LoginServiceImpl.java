package com.bantads.auth.service;

import com.bantads.auth.dto.LoginResponseDTO;
import com.bantads.auth.dto.LoginRequestDTO;
import com.bantads.auth.dto.UsuarioDTO;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;
import com.bantads.auth.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getLogin(),
                loginRequest.getSenha()
        );

        Authentication authentication = authenticationManager.authenticate(authToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getLogin())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        String token = tokenService.generateToken(user);
        
        // Nome passado como nulo, pois a tabela de Auth não possui mais essa coluna
        UsuarioDTO usuarioInfo = new UsuarioDTO(null, user.getReferenciaId(), user.getEmail());

        return new LoginResponseDTO(token, user.getTipo().name(), usuarioInfo);
    }
}