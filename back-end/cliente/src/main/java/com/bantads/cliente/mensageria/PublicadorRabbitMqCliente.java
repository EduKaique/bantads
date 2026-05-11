package com.bantads.cliente.mensageria;

import com.bantads.cliente.config.RabbitMqConfiguracao;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PublicadorRabbitMqCliente {

    private final RabbitTemplate rabbitTemplate;

    public PublicadorRabbitMqCliente(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publicar(EventoAlteracaoPerfilInterno eventoInterno) {
        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_CLIENTE,
            RabbitMqConfiguracao.CHAVE_ALTERACAO_PERFIL,
            eventoInterno.evento()
        );
    }
}