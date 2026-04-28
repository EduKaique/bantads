package com.bantads.gerente.mensageria;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.gerente.config.RabbitMqConfiguracao;

@Component
public class PublicadorSagaInsercaoGerente {

    private final RabbitTemplate rabbitTemplate;

    public PublicadorSagaInsercaoGerente(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publicarConsultaGerenteMaisContas(String sagaId) {
        var evento = new EventoConsultaGerenteMaisContas(sagaId);
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_CONSULTAR_GERENTE_MAIS_CONTAS,
            evento
        );
    }

    public void publicarSolicitacaoAtribuicaoConta(
        String sagaId,
        String cpfNovoGerente,
        String cpfGerenteOrigem
    ) {
        var evento = new EventoSolicitacaoAtribuicaoConta(
            sagaId,
            cpfNovoGerente,
            cpfGerenteOrigem,
            false,
            "Atribuição de conta iniciada"
        );
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_ATRIBUIR_CONTA,
            evento
        );
    }
}
