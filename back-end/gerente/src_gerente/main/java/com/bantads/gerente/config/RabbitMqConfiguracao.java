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

    public static final String EXCHANGE_GERENTE = "gerente.exchange";
    public static final String CHAVE_ALTERACAO_GERENTE = "gerente.perfil.alterado";

    public static final String EXCHANGE_INSERCAO_GERENTE = "gerente.insercao.exchange";
    
    public static final String FILA_CONSULTAR_GERENTE_MAIS_CONTAS = "gerente.consultar-mais-contas.queue";
    public static final String CHAVE_CONSULTAR_GERENTE_MAIS_CONTAS = "gerente.consultar-mais-contas";
    
    public static final String FILA_RESPOSTA_GERENTE_MAIS_CONTAS = "gerente.resposta-mais-contas.queue";
    public static final String CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS = "gerente.resposta-mais-contas";
    
    public static final String FILA_ATRIBUIR_CONTA = "gerente.atribuir-conta.queue";
    public static final String CHAVE_ATRIBUIR_CONTA = "gerente.atribuir-conta";
    
    public static final String FILA_RESPOSTA_ATRIBUICAO_CONTA = "gerente.resposta-atribuicao.queue";
    public static final String CHAVE_RESPOSTA_ATRIBUICAO_CONTA = "gerente.resposta-atribuicao";

    public static final String EXCHANGE_REMOCAO_GERENTE = "gerente.remocao.exchange";
    
    public static final String FILA_CONSULTAR_GERENTE_MENOS_CONTAS = "gerente.consultar-menos-contas.queue";
    public static final String CHAVE_CONSULTAR_GERENTE_MENOS_CONTAS = "gerente.consultar-menos-contas";
    
    public static final String FILA_RESPOSTA_GERENTE_MENOS_CONTAS = "gerente.resposta-menos-contas.queue";
    public static final String CHAVE_RESPOSTA_GERENTE_MENOS_CONTAS = "gerente.resposta-menos-contas";
    
    public static final String FILA_TRANSFERENCIA_CONTAS_REMOCAO = "gerente.transferencia-contas-remocao.queue";
    public static final String CHAVE_TRANSFERENCIA_CONTAS_REMOCAO = "gerente.transferencia-contas-remocao";
    
    public static final String FILA_RESPOSTA_TRANSFERENCIA_CONTAS = "gerente.resposta-transferencia-contas.queue";
    public static final String CHAVE_RESPOSTA_TRANSFERENCIA_CONTAS = "gerente.resposta-transferencia-contas";

    @Bean
    public DirectExchange exchangeGerente() {
        return new DirectExchange(EXCHANGE_GERENTE, true, false);
    }

    @Bean
    public DirectExchange exchangeInsercaoGerente() {
        return new DirectExchange(EXCHANGE_INSERCAO_GERENTE, true, false);
    }

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

    @Bean
    public DirectExchange exchangeRemocaoGerente() {
        return new DirectExchange(EXCHANGE_REMOCAO_GERENTE, true, false);
    }

    @Bean
    public Queue filaConsultarGerenteMenosContas() {
        return new Queue(FILA_CONSULTAR_GERENTE_MENOS_CONTAS, true);
    }

    @Bean
    public Queue filaRespostaGerenteMenosContas() {
        return new Queue(FILA_RESPOSTA_GERENTE_MENOS_CONTAS, true);
    }

    @Bean
    public Queue filaTransferenciaContasRemocao() {
        return new Queue(FILA_TRANSFERENCIA_CONTAS_REMOCAO, true);
    }

    @Bean
    public Queue filaRespostaTransferenciaContas() {
        return new Queue(FILA_RESPOSTA_TRANSFERENCIA_CONTAS, true);
    }

    @Bean
    public Binding bindingConsultarGerenteMenosContas(Queue filaConsultarGerenteMenosContas, DirectExchange exchangeRemocaoGerente) {
        return BindingBuilder.bind(filaConsultarGerenteMenosContas)
            .to(exchangeRemocaoGerente)
            .with(CHAVE_CONSULTAR_GERENTE_MENOS_CONTAS);
    }

    @Bean
    public Binding bindingRespostaGerenteMenosContas(Queue filaRespostaGerenteMenosContas, DirectExchange exchangeRemocaoGerente) {
        return BindingBuilder.bind(filaRespostaGerenteMenosContas)
            .to(exchangeRemocaoGerente)
            .with(CHAVE_RESPOSTA_GERENTE_MENOS_CONTAS);
    }

    @Bean
    public Binding bindingTransferenciaContasRemocao(Queue filaTransferenciaContasRemocao, DirectExchange exchangeRemocaoGerente) {
        return BindingBuilder.bind(filaTransferenciaContasRemocao)
            .to(exchangeRemocaoGerente)
            .with(CHAVE_TRANSFERENCIA_CONTAS_REMOCAO);
    }

    @Bean
    public Binding bindingRespostaTransferenciaContas(Queue filaRespostaTransferenciaContas, DirectExchange exchangeRemocaoGerente) {
        return BindingBuilder.bind(filaRespostaTransferenciaContas)
            .to(exchangeRemocaoGerente)
            .with(CHAVE_RESPOSTA_TRANSFERENCIA_CONTAS);
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
