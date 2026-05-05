package com.bantads.cliente.mensageria.aprovacao;

import com.bantads.cliente.config.RabbitMqConfiguracao;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class PublicadorAprovacaoCliente {

    private static final String EXPIRACAO_COMANDO_CRIACAO_MS = "60000";

    private final RabbitTemplate rabbitTemplate;

    public PublicadorAprovacaoCliente(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void solicitarCriacaoConta(ComandoCriacaoContaAprovacao comando) {
        publicarComExpiracao(RabbitMqConfiguracao.CHAVE_CRIAR_CONTA_APROVACAO, comando);
    }

    public void solicitarCriacaoAcesso(ComandoCriacaoAcessoAprovacao comando) {
        publicarComExpiracao(RabbitMqConfiguracao.CHAVE_CRIAR_ACESSO_APROVACAO, comando);
    }

    public void solicitarCompensacaoConta(ComandoCompensacaoContaAprovacao comando) {
        publicar(RabbitMqConfiguracao.CHAVE_COMPENSAR_CONTA_APROVACAO, comando);
    }

    public void solicitarCompensacaoAcesso(ComandoCompensacaoAcessoAprovacao comando) {
        publicar(RabbitMqConfiguracao.CHAVE_COMPENSAR_ACESSO_APROVACAO, comando);
    }

    private void publicar(String chave, Object mensagem) {
        rabbitTemplate.convertAndSend(RabbitMqConfiguracao.EXCHANGE_APROVACAO_CLIENTE, chave, mensagem);
    }

    private void publicarComExpiracao(String chave, Object mensagem) {
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_APROVACAO_CLIENTE,
            chave,
            mensagem,
            mensagemRabbit -> {
                mensagemRabbit.getMessageProperties().setExpiration(EXPIRACAO_COMANDO_CRIACAO_MS);
                return mensagemRabbit;
            }
        );
    }
}
