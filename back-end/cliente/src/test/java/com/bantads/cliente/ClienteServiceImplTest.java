package com.bantads.cliente.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.cliente.dto.PerfilInfoDTO;
import com.bantads.cliente.mensageria.EventoAlteracaoPerfilInterno;
import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.repository.ClienteRepository;

@ExtendWith(MockitoExtension.class)
public class ClienteServiceImplTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ClienteServiceImpl clienteService;

    private Cliente clienteMock;
    private PerfilInfoDTO dtoMock;

    @BeforeEach
    void setUp() {
        clienteMock = new Cliente();
        clienteMock.setCpf("12345678901");
        clienteMock.setNome("Nome Antigo");

        dtoMock = new PerfilInfoDTO();
        dtoMock.setNome("Nome Novo");
        dtoMock.setEmail("novo@email.com");
    }

    @Test
    void deveAlterarPerfilEDispararEventoSagaComSucesso() {
        when(clienteRepository.findById("12345678901")).thenReturn(Optional.of(clienteMock));
        clienteService.alterarPerfil("12345678901", dtoMock);
        assertEquals("Nome Novo", clienteMock.getNome());
        verify(clienteRepository, times(1)).save(clienteMock);
        verify(eventPublisher, times(1)).publishEvent(any(EventoAlteracaoPerfilInterno.class));
    }

    @Test
    void deveLancarExcecaoQuandoClienteNaoExistirAoAlterarPerfil() {
        when(clienteRepository.findById("00000000000")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            clienteService.alterarPerfil("00000000000", dtoMock);
        });
        verify(clienteRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }
}