package com.bantads.cliente.config;

import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfiguracao {

    public static final String EXCHANGE_CLIENTE = "cliente.exchange";
    public static final String CHAVE_ALTERACAO_PERFIL = "cliente.perfil.alterado";
    public static final String EXCHANGE_APROVACAO_CLIENTE = "cliente.aprovacao.exchange";

    public static final String FILA_RESULTADO_CONTA_APROVACAO = "cliente.aprovacao.conta.resultado.queue";
    public static final String FILA_RESULTADO_ACESSO_APROVACAO = "cliente.aprovacao.auth.resultado.queue";

    public static final String CHAVE_CRIAR_CONTA_APROVACAO = "aprovacao.conta.criar";
    public static final String CHAVE_COMPENSAR_CONTA_APROVACAO = "aprovacao.conta.compensar";
    public static final String CHAVE_CONTA_CRIADA_APROVACAO = "aprovacao.conta.criada";
    public static final String CHAVE_CONTA_FALHA_APROVACAO = "aprovacao.conta.falha";
    public static final String CHAVE_CONTA_COMPENSADA_APROVACAO = "aprovacao.conta.compensada";

    public static final String CHAVE_CRIAR_ACESSO_APROVACAO = "aprovacao.auth.criar";
    public static final String CHAVE_COMPENSAR_ACESSO_APROVACAO = "aprovacao.auth.compensar";
    public static final String CHAVE_ACESSO_CRIADO_APROVACAO = "aprovacao.auth.criado";
    public static final String CHAVE_ACESSO_FALHA_APROVACAO = "aprovacao.auth.falha";
    public static final String CHAVE_ACESSO_COMPENSADO_APROVACAO = "aprovacao.auth.compensado";

    @Bean
    public DirectExchange exchangeCliente() {
        return new DirectExchange(EXCHANGE_CLIENTE);
    }

    @Bean
    public DirectExchange exchangeAprovacaoCliente() {
        return new DirectExchange(EXCHANGE_APROVACAO_CLIENTE, true, false);
    }

    @Bean
    public Queue filaResultadoContaAprovacao() {
        return new Queue(FILA_RESULTADO_CONTA_APROVACAO, true);
    }

    @Bean
    public Queue filaResultadoAcessoAprovacao() {
        return new Queue(FILA_RESULTADO_ACESSO_APROVACAO, true);
    }

    @Bean
    public Binding bindingContaCriadaAprovacao(Queue filaResultadoContaAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaResultadoContaAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_CONTA_CRIADA_APROVACAO);
    }

    @Bean
    public Binding bindingContaFalhaAprovacao(Queue filaResultadoContaAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaResultadoContaAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_CONTA_FALHA_APROVACAO);
    }

    @Bean
    public Binding bindingContaCompensadaAprovacao(Queue filaResultadoContaAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaResultadoContaAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_CONTA_COMPENSADA_APROVACAO);
    }

    @Bean
    public Binding bindingAcessoCriadoAprovacao(Queue filaResultadoAcessoAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaResultadoAcessoAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_ACESSO_CRIADO_APROVACAO);
    }

    @Bean
    public Binding bindingAcessoFalhaAprovacao(Queue filaResultadoAcessoAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaResultadoAcessoAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_ACESSO_FALHA_APROVACAO);
    }

    @Bean
    public Binding bindingAcessoCompensadoAprovacao(Queue filaResultadoAcessoAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaResultadoAcessoAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_ACESSO_COMPENSADO_APROVACAO);
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
