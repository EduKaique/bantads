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
        // Cada remocao recebe um identificador proprio para rastrear o fluxo assincrono.
        // O service mantem a entrada simples e deixa as validacoes de negocio no orquestrador.
        // Isso evita duplicar regras entre controller, service e mensageria.
        String sagaId = UUID.randomUUID().toString();
        orquestrador.iniciarSaga(sagaId, cpfGerenteParaRemover);
    }

    public EstadoSagaRemocao consultarStatusSaga(String sagaId) {
        // A consulta retorna o estado em memoria gerenciado pelo orquestrador da remocao.
        // Quem chama pode diferenciar etapas intermediarias sem conhecer as filas RabbitMQ.
        return orquestrador.obterEstadoSaga(sagaId);
    }
}
