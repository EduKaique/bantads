package com.bantads.back_end.service;

import com.bantads.back_end.dto.ClientDTO;
import com.bantads.back_end.dto.ClientRegisterDTO;

public interface RegistrationService {
    
    /**
     * Orquestra o autocadastro de um novo cliente.
     * Valida, gera senha aleatória, salva e envia o e-mail.
     * @param registerDTO Dados do formulário de registro.
     * @return O ClientDTO do cliente criado.
     */
    ClientDTO registerNewClient(ClientRegisterDTO registerDTO);
}