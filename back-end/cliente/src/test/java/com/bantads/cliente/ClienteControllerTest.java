package com.bantads.cliente.controller;

import com.bantads.cliente.dto.AutocadastroInfoDTO;
import com.bantads.cliente.service.ClienteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
public class ClienteControllerTest {

    @Mock
    private ClienteService clienteService;

    @InjectMocks
    private ClienteController clienteController;

    @Test
    @DisplayName("Deve retornar status 201 (CREATED) ao autocadastrar um cliente com sucesso")
    public void deveRetornarCreatedAoAutocadastrarCliente() {
        AutocadastroInfoDTO mockDto = new AutocadastroInfoDTO();
        mockDto.setNome("Cliente Teste de Commit");
        mockDto.setEmail("commit@bantads.com");
        mockDto.setCpf("00011122233");

        doNothing().when(clienteService).autocadastrar(any(AutocadastroInfoDTO.class));

        ResponseEntity<?> response = clienteController.autocadastro(mockDto);

        assertNotNull(response, "A resposta não deveria ser nula");
        assertEquals(HttpStatus.CREATED, response.getStatusCode(), "O status HTTP deve ser 201 CREATED");
        
        verify(clienteService, times(1)).autocadastrar(any(AutocadastroInfoDTO.class));
    }
}