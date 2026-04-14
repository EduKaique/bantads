package com.bantads.conta.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfiguracao {

    public static final String EXCHANGE_MOVIMENTACAO = "conta.movimentacao.exchange";
    public static final String FILA_MOVIMENTACAO = "conta.movimentacao.queue";
    public static final String CHAVE_MOVIMENTACAO = "conta.movimentacao";

    @Bean
    public DirectExchange exchangeMovimentacao() {
        return new DirectExchange(EXCHANGE_MOVIMENTACAO);
    }

    @Bean
    public Queue filaMovimentacao() {
        return new Queue(FILA_MOVIMENTACAO, true);
    }

    @Bean
    public Binding bindingMovimentacao(Queue filaMovimentacao, DirectExchange exchangeMovimentacao) {
        return BindingBuilder.bind(filaMovimentacao)
            .to(exchangeMovimentacao)
            .with(CHAVE_MOVIMENTACAO);
    }

    @Bean
    public JacksonJsonMessageConverter conversorJsonRabbitMq() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
        ConnectionFactory connectionFactory,
        JacksonJsonMessageConverter conversorJsonRabbitMq
    ) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(conversorJsonRabbitMq);
        return rabbitTemplate;
    }
}
