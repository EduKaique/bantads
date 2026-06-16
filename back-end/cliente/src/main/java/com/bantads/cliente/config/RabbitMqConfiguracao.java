package com.bantads.cliente.config;

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

    public static final String EXCHANGE_AUTOCADASTRO = "autocadastro.exchange";
    public static final String FILA_RESPOSTA_GERENTE = "cliente.autocadastro.resposta-gerente.queue";
    public static final String CHAVE_SOLICITACAO_GERENTE = "autocadastro.solicitar.gerente";
    public static final String CHAVE_RESPOSTA_GERENTE = "autocadastro.resposta.gerente";

    public static final String CHAVE_TRANSFERENCIA_CONTAS_REMOCAO = "gerente.transferencia-contas-remocao";

    public static final String EXCHANGE_INSERCAO_GERENTE                     = "gerente.insercao.exchange";
    public static final String FILA_CONSULTAR_GERENTE_MAIS_CONTAS_CLIENTE    = "gerente.consultar-mais-contas.queue";
    public static final String CHAVE_CONSULTAR_GERENTE_MAIS_CONTAS           = "gerente.consultar-mais-contas";
    public static final String CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS            = "gerente.resposta-mais-contas";
    public static final String CHAVE_ATRIBUIR_CONTA                          = "gerente.atribuir-conta";
    public static final String CHAVE_RESPOSTA_ATRIBUICAO_CONTA               = "gerente.resposta-atribuicao";

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
    public Queue filaAtribuirContaCliente() {
        return new Queue("cliente.atribuir-conta.queue", true);
    }

    @Bean
    public Queue filaTransferenciaContasRemocaoCliente() {
        return new Queue("cliente.transferir-contas-remocao.queue", true);
    }

    @Bean
    public DirectExchange exchangeRemocaoGerente() {
        return new DirectExchange("gerente.remocao.exchange");
    }

    @Bean
    public Binding bindingTransferenciaRemocaoCliente() {
        return BindingBuilder.bind(filaTransferenciaContasRemocaoCliente())
                .to(exchangeRemocaoGerente())
                .with(CHAVE_TRANSFERENCIA_CONTAS_REMOCAO);
    }

    @Bean
    public DirectExchange exchangeInsercaoGerente() {
        return new DirectExchange(EXCHANGE_INSERCAO_GERENTE);
    }

    @Bean
    public Queue filaConsultarGerenteMaisContasCliente() {
        return new Queue(FILA_CONSULTAR_GERENTE_MAIS_CONTAS_CLIENTE, true);
    }

    @Bean
    public Binding bindingConsultarGerenteMaisContasCliente() {
        return BindingBuilder.bind(filaConsultarGerenteMaisContasCliente())
                .to(exchangeInsercaoGerente())
                .with(CHAVE_CONSULTAR_GERENTE_MAIS_CONTAS);
    }

    @Bean
    public Binding bindingAtribuirContaCliente() {
        return BindingBuilder.bind(filaAtribuirContaCliente())
                .to(exchangeInsercaoGerente())
                .with(CHAVE_ATRIBUIR_CONTA);
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
        JacksonJsonMessageConverter converter = new JacksonJsonMessageConverter();
        converter.setAlwaysConvertToInferredType(true);
        return converter;
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

    @Bean
    public DirectExchange exchangeAutocadastro() {
        return new DirectExchange(EXCHANGE_AUTOCADASTRO, true, false);
    }

    @Bean
    public Queue filaRespostaGerenteAutocadastro() {
        return new Queue(FILA_RESPOSTA_GERENTE, true);
    }

    @Bean
    public Binding bindingRespostaGerenteAutocadastro(Queue filaRespostaGerenteAutocadastro, DirectExchange exchangeAutocadastro) {
        return BindingBuilder.bind(filaRespostaGerenteAutocadastro)
            .to(exchangeAutocadastro)
            .with(CHAVE_RESPOSTA_GERENTE);
    }
}
