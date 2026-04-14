package com.bantads.conta.mensageria;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.bantads.conta.config.RabbitMqConfiguracao;

@Component
public class PublicadorRabbitMqConta {

    private final RabbitTemplate rabbitTemplate;

    public PublicadorRabbitMqConta(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publicar(EventoMovimentacaoContaInterno eventoInterno) {
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_MOVIMENTACAO,
            RabbitMqConfiguracao.CHAVE_MOVIMENTACAO,
            eventoInterno.evento()
        );
    }
}
