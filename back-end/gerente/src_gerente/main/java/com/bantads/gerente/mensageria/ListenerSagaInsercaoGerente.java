package com.bantads.gerente.mensageria;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.bantads.gerente.config.RabbitMqConfiguracao;

@Component
public class ListenerSagaInsercaoGerente {

    private final OrquestradorSagaInsercaoGerente orquestrador;

    public ListenerSagaInsercaoGerente(OrquestradorSagaInsercaoGerente orquestrador) {
        this.orquestrador = orquestrador;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_RESPOSTA_GERENTE_MAIS_CONTAS)
    public void consumirRespostaGerenteMaisContas(EventoRespostaGerenteMaisContas evento) {
        System.out.println("Resposta gerente com mais contas recebida: " + evento.sagaId());
        orquestrador.processarRespostaGerenteMaisContas(evento);
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_RESPOSTA_ATRIBUICAO_CONTA)
    public void consumirRespostaAtribuicaoConta(EventoRespostaAtribuicaoConta evento) {
        System.out.println("Resposta atribuição de conta recebida: " + evento.sagaId());
        orquestrador.processarRespostaAtribuicaoConta(evento);
    }
}
