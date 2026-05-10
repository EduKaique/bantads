package com.bantads.gerente.mensageria;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.bantads.gerente.config.RabbitMqConfiguracao;

@Component
public class ListenerSagaRemocaoGerente {

    private final OrquestradorSagaRemocaoGerente orquestrador;

    public ListenerSagaRemocaoGerente(OrquestradorSagaRemocaoGerente orquestrador) {
        this.orquestrador = orquestrador;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_RESPOSTA_GERENTE_MENOS_CONTAS)
    public void consumirRespostaGerenteMenosContas(EventoRespostaGerenteMenosContas evento) {
        System.out.println("Resposta gerente com menos contas recebida: " + evento.sagaId());
        orquestrador.processarRespostaGerenteMenosContas(evento);
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_RESPOSTA_TRANSFERENCIA_CONTAS)
    public void consumirRespostaTransferenciaContas(EventoRespostaTransferenciaContas evento) {
        System.out.println("Resposta transferência de contas recebida: " + evento.sagaId());
        orquestrador.processarRespostaTransferenciaContas(evento);
    }
}
