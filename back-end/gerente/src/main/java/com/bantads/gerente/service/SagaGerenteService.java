package com.bantads.gerente.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;
import com.bantads.gerente.mensageria.EstadoSagaInsercao;
import com.bantads.gerente.mensageria.OrquestradorSagaInsercaoGerente;
import com.bantads.gerente.model.Gerente;
import com.bantads.gerente.repository.GerenteRepository;

@Service
public class SagaGerenteService {

    private final OrquestradorSagaInsercaoGerente orquestrador;
    private final GerenteRepository gerenteRepository;

    public SagaGerenteService(
        OrquestradorSagaInsercaoGerente orquestrador,
        GerenteRepository gerenteRepository
    ) {
        this.orquestrador = orquestrador;
        this.gerenteRepository = gerenteRepository;
    }

    public String iniciarInsercaoGerente(GerenteInsercaoDTO dto) {
        if (gerenteRepository.existsByCpf(dto.getCpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        if (gerenteRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }

        String sagaId = UUID.randomUUID().toString();
        orquestrador.iniciarSaga(sagaId, dto);
        return sagaId;
    }

    public EstadoSagaInsercao consultarStatusSaga(String sagaId) {
        // O status permite observar se a criacao ja terminou ou se aguarda atribuicao de conta.
        return orquestrador.obterEstadoSaga(sagaId);
    }

    public GerenteResponseDTO buscarGerentePorCpf(String cpf) {
        // A busca direta por CPF e usada para confirmar o cadastro efetivado pela saga.
        Gerente gerente = gerenteRepository.findByCpf(cpf).orElse(null);

        if (gerente == null) {
            return null;
        }

        return GerenteResponseDTO.builder()
            .cpf(gerente.getCpf())
            .nome(gerente.getNome())
            .email(gerente.getEmail())
            .tipo(gerente.getTipo())
            .build();
    }
}
