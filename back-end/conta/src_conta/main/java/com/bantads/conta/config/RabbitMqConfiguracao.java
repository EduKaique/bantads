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
    
    public static final String EXCHANGE_CLIENTE = "cliente.exchange";
    public static final String FILA_CONTA_CLIENTE_ATUALIZADO = "conta.cliente.atualizado.queue";
    public static final String CHAVE_CLIENTE_ATUALIZADO = "cliente.perfil.alterado";

    // SAGA Inserção de Gerente
    public static final String EXCHANGE_INSERCAO_GERENTE = "gerente.insercao.exchange";
    public static final String FILA_ATRIBUIR_CONTA = "gerente.atribuir-conta.queue";
    public static final String CHAVE_ATRIBUIR_CONTA = "gerente.atribuir-conta";
    public static final String FILA_RESPOSTA_ATRIBUICAO_CONTA = "gerente.resposta-atribuicao.queue";
    public static final String CHAVE_RESPOSTA_ATRIBUICAO_CONTA = "gerente.resposta-atribuicao";

    // SAGA Remoção de Gerente
    public static final String EXCHANGE_REMOCAO_GERENTE = "gerente.remocao.exchange";
    public static final String FILA_CONSULTAR_GERENTE_MENOS_CONTAS = "gerente.consultar-menos-contas.queue";
    public static final String CHAVE_CONSULTAR_GERENTE_MENOS_CONTAS = "gerente.consultar-menos-contas";
    public static final String FILA_RESPOSTA_GERENTE_MENOS_CONTAS = "gerente.resposta-menos-contas.queue";
    public static final String CHAVE_RESPOSTA_GERENTE_MENOS_CONTAS = "gerente.resposta-menos-contas";
    public static final String FILA_TRANSFERENCIA_CONTAS_REMOCAO = "gerente.transferencia-contas-remocao.queue";
    public static final String CHAVE_TRANSFERENCIA_CONTAS_REMOCAO = "gerente.transferencia-contas-remocao";
    public static final String FILA_RESPOSTA_TRANSFERENCIA_CONTAS = "gerente.resposta-transferencia-contas.queue";
    public static final String CHAVE_RESPOSTA_TRANSFERENCIA_CONTAS = "gerente.resposta-transferencia-contas";

    public static final String EXCHANGE_APROVACAO_CLIENTE = "cliente.aprovacao.exchange";
    public static final String FILA_CRIAR_CONTA_APROVACAO = "conta.aprovacao.criar.queue";
    public static final String FILA_COMPENSAR_CONTA_APROVACAO = "conta.aprovacao.compensar.queue";
    public static final String CHAVE_CRIAR_CONTA_APROVACAO = "aprovacao.conta.criar";
    public static final String CHAVE_COMPENSAR_CONTA_APROVACAO = "aprovacao.conta.compensar";
    public static final String CHAVE_CONTA_CRIADA_APROVACAO = "aprovacao.conta.criada";
    public static final String CHAVE_CONTA_FALHA_APROVACAO = "aprovacao.conta.falha";
    public static final String CHAVE_CONTA_COMPENSADA_APROVACAO = "aprovacao.conta.compensada";

    //SAGA Autocadastro
    public static final String EXCHANGE_AUTOCADASTRO = "autocadastro.exchange";
    public static final String FILA_SOLICITACAO_GERENTE = "conta.autocadastro.solicitar-gerente.queue";
    public static final String CHAVE_SOLICITACAO_GERENTE = "autocadastro.solicitar.gerente";
    public static final String CHAVE_RESPOSTA_GERENTE = "autocadastro.resposta.gerente";


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

    // Exchange para SAGA Inserção de Gerente
    @Bean
    public DirectExchange exchangeInsercaoGerente() {
        return new DirectExchange(EXCHANGE_INSERCAO_GERENTE, true, false);
    }

    // Fila para receber solicitação de atribuição de conta
    @Bean
    public Queue filaAtribuirConta() {
        return new Queue(FILA_ATRIBUIR_CONTA, true);
    }

    // Fila para enviar resposta de atribuição
    @Bean
    public Queue filaRespostaAtribuicaoConta() {
        return new Queue(FILA_RESPOSTA_ATRIBUICAO_CONTA, true);
    }

    // Binding da fila de atribuição ao exchange
    @Bean
    public Binding bindingAtribuirConta(Queue filaAtribuirConta, DirectExchange exchangeInsercaoGerente) {
        return BindingBuilder.bind(filaAtribuirConta)
            .to(exchangeInsercaoGerente)
            .with(CHAVE_ATRIBUIR_CONTA);
    }

    // Binding da fila de resposta ao exchange
    @Bean
    public Binding bindingRespostaAtribuicaoConta(Queue filaRespostaAtribuicaoConta, DirectExchange exchangeInsercaoGerente) {
        return BindingBuilder.bind(filaRespostaAtribuicaoConta)
            .to(exchangeInsercaoGerente)
            .with(CHAVE_RESPOSTA_ATRIBUICAO_CONTA);
    }

    // Exchange para SAGA Remoção de Gerente
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

    // Fila para receber solicitação de transferência de contas
    @Bean
    public Queue filaTransferenciaContasRemocao() {
        return new Queue(FILA_TRANSFERENCIA_CONTAS_REMOCAO, true);
    }

    // Fila para enviar resposta de transferência
    @Bean
    public Queue filaRespostaTransferenciaContas() {
        return new Queue(FILA_RESPOSTA_TRANSFERENCIA_CONTAS, true);
    }

    // Binding da fila de transferência ao exchange
    @Bean
    public Binding bindingTransferenciaContasRemocao(Queue filaTransferenciaContasRemocao, DirectExchange exchangeRemocaoGerente) {
        return BindingBuilder.bind(filaTransferenciaContasRemocao)
            .to(exchangeRemocaoGerente)
            .with(CHAVE_TRANSFERENCIA_CONTAS_REMOCAO);
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

    // Binding da fila de resposta de transferência ao exchange
    @Bean
    public Binding bindingRespostaTransferenciaContas(Queue filaRespostaTransferenciaContas, DirectExchange exchangeRemocaoGerente) {
        return BindingBuilder.bind(filaRespostaTransferenciaContas)
            .to(exchangeRemocaoGerente)
            .with(CHAVE_RESPOSTA_TRANSFERENCIA_CONTAS);
    }

    @Bean
    public DirectExchange exchangeAprovacaoCliente() {
        return new DirectExchange(EXCHANGE_APROVACAO_CLIENTE, true, false);
    }

    @Bean
    public Queue filaCriarContaAprovacao() {
        return new Queue(FILA_CRIAR_CONTA_APROVACAO, true);
    }

    @Bean
    public Queue filaCompensarContaAprovacao() {
        return new Queue(FILA_COMPENSAR_CONTA_APROVACAO, true);
    }

    @Bean
    public Binding bindingCriarContaAprovacao(Queue filaCriarContaAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaCriarContaAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_CRIAR_CONTA_APROVACAO);
    }

    @Bean
    public Binding bindingCompensarContaAprovacao(Queue filaCompensarContaAprovacao, DirectExchange exchangeAprovacaoCliente) {
        return BindingBuilder.bind(filaCompensarContaAprovacao)
            .to(exchangeAprovacaoCliente)
            .with(CHAVE_COMPENSAR_CONTA_APROVACAO);
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

    @Bean
    public Queue filaContaClienteAtualizado() {
        return new Queue(FILA_CONTA_CLIENTE_ATUALIZADO, true);
    }

    @Bean
    public Binding bindingClienteAtualizado() {
        return BindingBuilder.bind(filaContaClienteAtualizado())
            .to(new DirectExchange(EXCHANGE_CLIENTE))
            .with(CHAVE_CLIENTE_ATUALIZADO);
    }

    @Bean
    public DirectExchange exchangeAutocadastro() {
        return new DirectExchange(EXCHANGE_AUTOCADASTRO, true, false);
    }

    @Bean
    public Queue filaSolicitacaoGerenteAutocadastro() {
        return new Queue(FILA_SOLICITACAO_GERENTE, true);
    }

    @Bean
    public Binding bindingSolicitacaoGerenteAutocadastro(Queue filaSolicitacaoGerenteAutocadastro, DirectExchange exchangeAutocadastro) {
        return BindingBuilder.bind(filaSolicitacaoGerenteAutocadastro)
            .to(exchangeAutocadastro)
            .with(CHAVE_SOLICITACAO_GERENTE);
    }
}
