package com.bantads.cliente.config;

import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfiguracao {

    public static final String EXCHANGE_CLIENTE = "cliente.exchange";
    public static final String CHAVE_ALTERACAO_PERFIL = "cliente.perfil.alterado";

    @Bean
    public DirectExchange exchangeCliente() {
        return new DirectExchange(EXCHANGE_CLIENTE);
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