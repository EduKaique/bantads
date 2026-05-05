package com.bantads.gerente.mensageria;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.bantads.gerente.config.RabbitMqConfiguracao;

@Component
public class PublicadorRabbitMqGerente {

    private final RabbitTemplate rabbitTemplate;

    public PublicadorRabbitMqGerente(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publicar(EventoAlteracaoGerenteInterno eventoInterno) {
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_GERENTE,
            RabbitMqConfiguracao.CHAVE_ALTERACAO_GERENTE,
            eventoInterno.evento()
        );
    }
}
