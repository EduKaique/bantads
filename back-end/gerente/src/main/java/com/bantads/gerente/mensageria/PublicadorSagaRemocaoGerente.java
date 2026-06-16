package com.bantads.gerente.mensageria;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.gerente.config.RabbitMqConfiguracao;

@Component
public class PublicadorSagaRemocaoGerente {

    public static final String OPERACAO_TRANSFERIR = "TRANSFERIR";
    public static final String OPERACAO_COMPENSAR = "COMPENSAR";

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
            OPERACAO_TRANSFERIR,
            false,
            "Transferencia de contas iniciada"
        );
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_TRANSFERENCIA_CONTAS_REMOCAO,
            evento
        );
    }

    public void publicarCompensacaoTransferenciaContas(
        String sagaId,
        String cpfGerenteParaRemover,
        String cpfGerenteDestino
    ) {
        var evento = new EventoTransferenciaContasRemocao(
            sagaId,
            cpfGerenteParaRemover,
            cpfGerenteDestino,
            OPERACAO_COMPENSAR,
            false,
            "Compensacao da transferencia de contas iniciada"
        );
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_TRANSFERENCIA_CONTAS_REMOCAO,
            evento
        );
    }

    public void publicarRemocaoAcessoGerente(String cpf) {
        rabbitTemplate.convertAndSend("gerente.exchange", "gerente.removido", cpf);
    }
}
