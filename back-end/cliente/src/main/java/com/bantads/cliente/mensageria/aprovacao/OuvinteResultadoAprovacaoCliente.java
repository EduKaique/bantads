package com.bantads.cliente.mensageria.aprovacao;

import com.bantads.cliente.config.RabbitMqConfiguracao;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OuvinteResultadoAprovacaoCliente {

    private final OrquestradorAprovacaoCliente orquestrador;

    public OuvinteResultadoAprovacaoCliente(OrquestradorAprovacaoCliente orquestrador) {
        this.orquestrador = orquestrador;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_RESULTADO_CONTA_APROVACAO)
    public void ouvirResultadoConta(ResultadoContaAprovacao resultado) {
        orquestrador.processarResultadoConta(resultado);
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_RESULTADO_ACESSO_APROVACAO)
    public void ouvirResultadoAcesso(ResultadoAcessoAprovacao resultado) {
        orquestrador.processarResultadoAcesso(resultado);
    }
}
