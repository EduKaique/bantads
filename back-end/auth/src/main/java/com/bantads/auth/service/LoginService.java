package com.bantads.auth.service;

import com.bantads.auth.dto.LoginRequestDTO;
import com.bantads.auth.dto.LoginResponseDTO;
import org.springframework.security.core.AuthenticationException;

public interface LoginService {
    LoginResponseDTO login(LoginRequestDTO loginRequest) 
    throws AuthenticationException;
}