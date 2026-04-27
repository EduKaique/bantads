package com.bantads.gerente.config;

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

    // SAGA Inserção de Gerente
    public static final String EXCHANGE_INSERCAO_GERENTE = "gerente.insercao.exchange";
    
    public static final String FILA_CONSULTAR_GERENTE_MAIS_CONTAS = "gerente.consultar-mais-contas.queue";
    public static final String CHAVE_CONSULTAR_GERENTE_MAIS_CONTAS = "gerente.consultar-mais-contas";
    
    public static final String FILA_RESPOSTA_GERENTE_MAIS_CONTAS = "gerente.resposta-mais-contas.queue";
    public static final String CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS = "gerente.resposta-mais-contas";
    
    public static final String FILA_ATRIBUIR_CONTA = "gerente.atribuir-conta.queue";
    public static final String CHAVE_ATRIBUIR_CONTA = "gerente.atribuir-conta";
    
    public static final String FILA_RESPOSTA_ATRIBUICAO_CONTA = "gerente.resposta-atribuicao.queue";
    public static final String CHAVE_RESPOSTA_ATRIBUICAO_CONTA = "gerente.resposta-atribuicao";

    // Exchange
    @Bean
    public DirectExchange exchangeInsercaoGerente() {
        return new DirectExchange(EXCHANGE_INSERCAO_GERENTE, true, false);
    }

    // Filas
    @Bean
    public Queue filaConsultarGerenteMaisContas() {
        return new Queue(FILA_CONSULTAR_GERENTE_MAIS_CONTAS, true);
    }

    @Bean
    public Queue filaRespostaGerenteMaisContas() {
        return new Queue(FILA_RESPOSTA_GERENTE_MAIS_CONTAS, true);
    }

    @Bean
    public Queue filaAtribuirConta() {
        return new Queue(FILA_ATRIBUIR_CONTA, true);
    }

    @Bean
    public Queue filaRespostaAtribuicaoConta() {
        return new Queue(FILA_RESPOSTA_ATRIBUICAO_CONTA, true);
    }

    // Bindings
    @Bean
    public Binding bindingConsultarGerenteMaisContas(Queue filaConsultarGerenteMaisContas, DirectExchange exchangeInsercaoGerente) {
        return BindingBuilder.bind(filaConsultarGerenteMaisContas)
            .to(exchangeInsercaoGerente)
            .with(CHAVE_CONSULTAR_GERENTE_MAIS_CONTAS);
    }

    @Bean
    public Binding bindingRespostaGerenteMaisContas(Queue filaRespostaGerenteMaisContas, DirectExchange exchangeInsercaoGerente) {
        return BindingBuilder.bind(filaRespostaGerenteMaisContas)
            .to(exchangeInsercaoGerente)
            .with(CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS);
    }

    @Bean
    public Binding bindingAtribuirConta(Queue filaAtribuirConta, DirectExchange exchangeInsercaoGerente) {
        return BindingBuilder.bind(filaAtribuirConta)
            .to(exchangeInsercaoGerente)
            .with(CHAVE_ATRIBUIR_CONTA);
    }

    @Bean
    public Binding bindingRespostaAtribuicaoConta(Queue filaRespostaAtribuicaoConta, DirectExchange exchangeInsercaoGerente) {
        return BindingBuilder.bind(filaRespostaAtribuicaoConta)
            .to(exchangeInsercaoGerente)
            .with(CHAVE_RESPOSTA_ATRIBUICAO_CONTA);
    }

    // JSON Message Converter
    @Bean
    public JacksonJsonMessageConverter conversorJsonRabbitMq() {
        return new JacksonJsonMessageConverter();
    }

    // RabbitTemplate
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
