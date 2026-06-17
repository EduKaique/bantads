package com.bantads.conta.mensageria.aprovacao;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.service.ServicoContaEscrita;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class OuvinteCriacaoContaAprovacao {

    private final ServicoContaEscrita servicoContaEscrita;
    private final RabbitTemplate rabbitTemplate;

    public OuvinteCriacaoContaAprovacao(
        ServicoContaEscrita servicoContaEscrita,
        RabbitTemplate rabbitTemplate
    ) {
        this.servicoContaEscrita = servicoContaEscrita;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CRIAR_CONTA_APROVACAO)
    public void ouvirCriacaoConta(ComandoCriacaoContaAprovacao comando) {
        ResultadoContaAprovacao resultado = servicoContaEscrita.criarContaAprovacao(comando);
        String chave = resultado.sucesso()
            ? RabbitMqConfiguracao.CHAVE_CONTA_CRIADA_APROVACAO
            : RabbitMqConfiguracao.CHAVE_CONTA_FALHA_APROVACAO;

        rabbitTemplate.convertAndSend(RabbitMqConfiguracao.EXCHANGE_APROVACAO_CLIENTE, chave, resultado);
    }
}
