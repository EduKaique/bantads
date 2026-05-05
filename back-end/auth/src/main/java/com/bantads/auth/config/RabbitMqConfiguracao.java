package com.bantads.auth.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfiguracao {

    public static final String EXCHANGE_APROVACAO_CLIENTE = "cliente.aprovacao.exchange";
    public static final String EXCHANGE_AUTOCADASTRO = "saga.autocadastro.exchange";

    public static final String FILA_CRIAR_ACESSO_APROVACAO = "auth.aprovacao.criar.queue";
    public static final String FILA_COMPENSAR_ACESSO_APROVACAO = "auth.aprovacao.compensar.queue";
    public static final String FILA_AUTOCADASTRO_AUTH = "saga.autocadastro.auth";
    public static final String FILA_AUTOCADASTRO_AUTH_ROLLBACK = "saga.autocadastro.auth.rollback";

    public static final String CHAVE_CRIAR_ACESSO_APROVACAO = "aprovacao.auth.criar";
    public static final String CHAVE_COMPENSAR_ACESSO_APROVACAO = "aprovacao.auth.compensar";
    public static final String CHAVE_ACESSO_CRIADO_APROVACAO = "aprovacao.auth.criado";
    public static final String CHAVE_ACESSO_FALHA_APROVACAO = "aprovacao.auth.falha";
    public static final String CHAVE_ACESSO_COMPENSADO_APROVACAO = "aprovacao.auth.compensado";
    public static final String CHAVE_AUTOCADASTRO_AUTH = "saga.autocadastro.auth";
    public static final String CHAVE_AUTOCADASTRO_AUTH_ROLLBACK = "saga.autocadastro.auth.rollback";

    @Bean
    public DirectExchange exchangeAprovacaoCliente() {
        return new DirectExchange(EXCHANGE_APROVACAO_CLIENTE, true, false);
    }

    @Bean
    public DirectExchange exchangeAutocadastro() {
        return new DirectExchange(EXCHANGE_AUTOCADASTRO, true, false);
    }

    @Bean
    public Queue filaCriarAcessoAprovacao() {
        return new Queue(FILA_CRIAR_ACESSO_APROVACAO, true);
    }

    @Bean
    public Queue filaCompensarAcessoAprovacao() {
        return new Queue(FILA_COMPENSAR_ACESSO_APROVACAO, true);
    }

    @Bean
    public Queue filaAutocadastroAuth() {
        return new Queue(FILA_AUTOCADASTRO_AUTH, true);
    }

    @Bean
    public Queue filaAutocadastroAuthRollback() {
        return new Queue(FILA_AUTOCADASTRO_AUTH_ROLLBACK, true);
    }

    @Bean
    public Binding bindingCriarAcessoAprovacao(Queue filaCriarAcessoAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaCriarAcessoAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_CRIAR_ACESSO_APROVACAO);
    }

    @Bean
    public Binding bindingCompensarAcessoAprovacao(Queue filaCompensarAcessoAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaCompensarAcessoAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_COMPENSAR_ACESSO_APROVACAO);
    }

    @Bean
    public Binding bindingAutocadastroAuth(Queue filaAutocadastroAuth, DirectExchange exchangeAutocadastro) {
        return BindingBuilder.bind(filaAutocadastroAuth)
            .to(exchangeAutocadastro)
            .with(CHAVE_AUTOCADASTRO_AUTH);
    }

    @Bean
    public Binding bindingAutocadastroAuthRollback(Queue filaAutocadastroAuthRollback, DirectExchange exchangeAutocadastro) {
        return BindingBuilder.bind(filaAutocadastroAuthRollback)
            .to(exchangeAutocadastro)
            .with(CHAVE_AUTOCADASTRO_AUTH_ROLLBACK);
    }

    @Bean
    public Jackson2JsonMessageConverter conversorJsonRabbitMq() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
        ConnectionFactory connectionFactory,
        Jackson2JsonMessageConverter conversorJsonRabbitMq
    ) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(conversorJsonRabbitMq);
        return rabbitTemplate;
    }
}
