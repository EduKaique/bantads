package com.bantads.gerente.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bantads.gerente.mensageria.EstadoSagaRemocao;
import com.bantads.gerente.mensageria.OrquestradorSagaRemocaoGerente;

@Service
public class SagaRemocaoGerenteService {

    private final OrquestradorSagaRemocaoGerente orquestrador;

    public SagaRemocaoGerenteService(OrquestradorSagaRemocaoGerente orquestrador) {
        this.orquestrador = orquestrador;
    }

    public void iniciarRemocaoGerente(String cpfGerenteParaRemover) {
        String sagaId = UUID.randomUUID().toString();
        orquestrador.iniciarSaga(sagaId, cpfGerenteParaRemover);
    }

    public EstadoSagaRemocao consultarStatusSaga(String sagaId) {
        return orquestrador.obterEstadoSaga(sagaId);
    }
}
