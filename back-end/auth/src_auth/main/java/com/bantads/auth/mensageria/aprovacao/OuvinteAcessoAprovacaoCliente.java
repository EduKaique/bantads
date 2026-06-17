package com.bantads.auth.mensageria.aprovacao;

import com.bantads.auth.config.RabbitMqConfiguracao;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class OuvinteAcessoAprovacaoCliente {

    private final ServicoAcessoAprovacaoCliente servicoAcesso;
    private final RabbitTemplate rabbitTemplate;

    public OuvinteAcessoAprovacaoCliente(
        ServicoAcessoAprovacaoCliente servicoAcesso,
        RabbitTemplate rabbitTemplate
    ) {
        this.servicoAcesso = servicoAcesso;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CRIAR_ACESSO_APROVACAO)
    public void ouvirCriacaoAcesso(ComandoCriacaoAcessoAprovacao comando) {
        ResultadoAcessoAprovacao resultado = servicoAcesso.criarAcessoInicial(comando);
        String chave = resultado.sucesso()
            ? RabbitMqConfiguracao.CHAVE_ACESSO_CRIADO_APROVACAO
            : RabbitMqConfiguracao.CHAVE_ACESSO_FALHA_APROVACAO;

        rabbitTemplate.convertAndSend(RabbitMqConfiguracao.EXCHANGE_APROVACAO_CLIENTE, chave, resultado);
    }
}
