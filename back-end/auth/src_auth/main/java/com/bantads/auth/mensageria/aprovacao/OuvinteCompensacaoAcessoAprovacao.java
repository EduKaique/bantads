package com.bantads.auth.mensageria.aprovacao;

import com.bantads.auth.config.RabbitMqConfiguracao;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class OuvinteCompensacaoAcessoAprovacao {

    private final ServicoAcessoAprovacaoCliente servicoAcesso;
    private final RabbitTemplate rabbitTemplate;

    public OuvinteCompensacaoAcessoAprovacao(
        ServicoAcessoAprovacaoCliente servicoAcesso,
        RabbitTemplate rabbitTemplate
    ) {
        this.servicoAcesso = servicoAcesso;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_COMPENSAR_ACESSO_APROVACAO)
    public void ouvirCompensacaoAcesso(ComandoCompensacaoAcessoAprovacao comando) {
        ResultadoAcessoAprovacao resultado = servicoAcesso.compensarAcesso(
            comando.idSaga(),
            comando.cpfCliente(),
            comando.emailCliente()
        );

        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_APROVACAO_CLIENTE,
            RabbitMqConfiguracao.CHAVE_ACESSO_COMPENSADO_APROVACAO,
            resultado
        );
    }
}
