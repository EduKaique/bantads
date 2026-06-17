package com.bantads.conta.mensageria.aprovacao;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.service.ServicoContaEscrita;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class OuvinteCompensacaoContaAprovacao {

    private final ServicoContaEscrita servicoContaEscrita;
    private final RabbitTemplate rabbitTemplate;

    public OuvinteCompensacaoContaAprovacao(
        ServicoContaEscrita servicoContaEscrita,
        RabbitTemplate rabbitTemplate
    ) {
        this.servicoContaEscrita = servicoContaEscrita;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_COMPENSAR_CONTA_APROVACAO)
    public void ouvirCompensacaoConta(ComandoCompensacaoContaAprovacao comando) {
        ResultadoContaAprovacao resultado = servicoContaEscrita.compensarContaAprovacao(
            comando.idSaga(),
            comando.cpfCliente(),
            comando.numeroConta()
        );

        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_APROVACAO_CLIENTE,
            RabbitMqConfiguracao.CHAVE_CONTA_COMPENSADA_APROVACAO,
            resultado
        );
    }
}
