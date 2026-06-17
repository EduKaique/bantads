package com.bantads.conta.mensageria.saga;

import java.math.BigDecimal;
import java.util.Comparator;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;

@Component
public class ListenerConsultaGerenteMenosContas {

    private final RepositorioContaEscrita contaEscritaRepository;
    private final RabbitTemplate rabbitTemplate;

    public ListenerConsultaGerenteMenosContas(
        RepositorioContaEscrita contaEscritaRepository,
        RabbitTemplate rabbitTemplate
    ) {
        this.contaEscritaRepository = contaEscritaRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CONSULTAR_GERENTE_MENOS_CONTAS)
    public void consumirConsultaGerenteMenosContas(EventoConsultaGerenteMenosContas evento) {
        System.out.println("Consulta gerente com menos contas recebida no conta: " + evento.sagaId());

        try {
            if (evento.cpfsGerentesCandidatos() == null || evento.cpfsGerentesCandidatos().isEmpty()) {
                enviarRespostaErro(evento.sagaId(), "Nao ha outro gerente para receber as contas");
                return;
            }

            var contas = contaEscritaRepository.findAll();

            var gerenteDestino = evento.cpfsGerentesCandidatos()
                .stream()
                .map(cpf -> {
                    var contasDoGerente = contas.stream()
                        .filter(conta -> cpf.equals(conta.getGerente()))
                        .toList();

                    var saldoTotal = contasDoGerente.stream()
                        .map(conta -> conta.getSaldo())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new GerenteCarga(cpf, contasDoGerente.size(), saldoTotal);
                })
                .min(Comparator
                    .comparingInt(GerenteCarga::quantidadeContas)
                    .thenComparing(GerenteCarga::cpf))
                .orElse(null);

            if (gerenteDestino == null) {
                enviarRespostaErro(evento.sagaId(), "Gerente com menos contas nao encontrado");
                return;
            }

            var resposta = new EventoRespostaGerenteMenosContas(
                evento.sagaId(),
                gerenteDestino.cpf(),
                gerenteDestino.quantidadeContas(),
                gerenteDestino.saldoTotal(),
                true,
                "Gerente com menos contas encontrado"
            );

            rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
                RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE_MENOS_CONTAS,
                resposta
            );
        } catch (Exception e) {
            System.err.println("Erro ao consultar gerente com menos contas no conta: " + e.getMessage());
            enviarRespostaErro(evento.sagaId(), "Erro ao consultar gerente: " + e.getMessage());
        }
    }

    private void enviarRespostaErro(String sagaId, String mensagem) {
        var resposta = new EventoRespostaGerenteMenosContas(
            sagaId,
            "",
            0,
            BigDecimal.ZERO,
            false,
            mensagem
        );

        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE_MENOS_CONTAS,
            resposta
        );
    }

    private record GerenteCarga(String cpf, int quantidadeContas, BigDecimal saldoTotal) {}
}
