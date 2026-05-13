package com.bantads.gerente.mensageria;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.gerente.config.RabbitMqConfiguracao;

@Component
public class PublicadorSagaRemocaoGerente {

    private final RabbitTemplate rabbitTemplate;

    public PublicadorSagaRemocaoGerente(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publicarConsultaGerenteMenosContas(
        String sagaId,
        String cpfGerenteParaRemover,
        List<String> cpfsGerentesCandidatos
    ) {
        var evento = new EventoConsultaGerenteMenosContas(
            sagaId,
            cpfGerenteParaRemover,
            cpfsGerentesCandidatos
        );
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_CONSULTAR_GERENTE_MENOS_CONTAS,
            evento
        );
    }

    public void publicarTransferenciaContas(
        String sagaId,
        String cpfGerenteParaRemover,
        String cpfGerenteMenosContas
    ) {
        var evento = new EventoTransferenciaContasRemocao(
            sagaId,
            cpfGerenteParaRemover,
            cpfGerenteMenosContas,
            false,
            "Transferência de contas iniciada"
        );
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_TRANSFERENCIA_CONTAS_REMOCAO,
            evento
        );
    }
}
