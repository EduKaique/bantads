package com.bantads.gerente.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

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

    public GerenteResponseDTO iniciarInsercaoGerente(GerenteInsercaoDTO dto) {
        // A insercao usa uma saga porque depende da distribuicao de contas em outro servico.
        // O UUID e devolvido apenas ao orquestrador, que acompanha as respostas dos listeners.
        // A resposta inicial espelha os dados recebidos enquanto a conclusao ocorre depois.
        String sagaId = UUID.randomUUID().toString();
        orquestrador.iniciarSaga(sagaId, dto);

        return GerenteResponseDTO.builder()
            .cpf(dto.getCpf())
            .nome(dto.getNome())
            .email(dto.getEmail())
            .tipo("gerente")
            .build();
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
