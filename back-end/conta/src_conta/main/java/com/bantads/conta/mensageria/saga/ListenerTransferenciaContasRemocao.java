package com.bantads.conta.mensageria.saga;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.entity.escrita.ContaEscrita;
import com.bantads.conta.entity.leitura.ContaLeitura;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import com.bantads.conta.repository.leitura.RepositorioContaLeitura;

import java.util.List;

@Component
public class ListenerTransferenciaContasRemocao {

    private static final String OPERACAO_TRANSFERIR = "TRANSFERIR";
    private static final String OPERACAO_COMPENSAR = "COMPENSAR";

    private final RepositorioContaEscrita contaEscritaRepository;
    private final RepositorioContaLeitura contaLeituraRepository;
    private final RabbitTemplate rabbitTemplate;

    public ListenerTransferenciaContasRemocao(
        RepositorioContaEscrita contaEscritaRepository,
        RepositorioContaLeitura contaLeituraRepository,
        RabbitTemplate rabbitTemplate
    ) {
        this.contaEscritaRepository = contaEscritaRepository;
        this.contaLeituraRepository = contaLeituraRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_TRANSFERENCIA_CONTAS_REMOCAO)
    public void consumirTransferenciaContasRemocao(EventoTransferenciaContasRemocao evento) {
        String operacao = normalizarOperacao(evento.operacao());
        System.out.println("Operacao de contas da saga de remocao recebida: " + evento.sagaId() + " - " + operacao);

        try {
            if (OPERACAO_COMPENSAR.equals(operacao)) {
                compensarTransferencia(evento);
                return;
            }

            transferirContas(evento);
        } catch (Exception e) {
            System.err.println("Erro na operacao de contas da saga de remocao: " + e.getMessage());
            enviarResposta(
                evento.sagaId(),
                operacao,
                0,
                false,
                "Erro na operacao de contas: " + e.getMessage()
            );
        }
    }

    private void transferirContas(EventoTransferenciaContasRemocao evento) {
        List<ContaEscrita> contasJaProcessadas = contaEscritaRepository
            .findByIdSagaRemocaoGerente(evento.sagaId());

        if (!contasJaProcessadas.isEmpty()) {
            enviarResposta(
                evento.sagaId(),
                OPERACAO_TRANSFERIR,
                contasJaProcessadas.size(),
                true,
                "Transferencia ja processada anteriormente"
            );
            return;
        }

        List<ContaEscrita> contasParaTransferir = contaEscritaRepository
            .findByGerente(evento.cpfGerenteParaRemover());

        if (contasParaTransferir.isEmpty()) {
            enviarResposta(evento.sagaId(), OPERACAO_TRANSFERIR, 0, true, "Nenhuma conta para transferir");
            return;
        }

        for (ContaEscrita conta : contasParaTransferir) {
            conta.setGerente(evento.cpfGerenteDestino());
            conta.setIdSagaRemocaoGerente(evento.sagaId());
            conta.setGerenteAnteriorRemocao(evento.cpfGerenteParaRemover());
            contaEscritaRepository.save(conta);
        }

        List<ContaLeitura> contasLeituraParaTransferir = contaLeituraRepository
            .findByGerente(evento.cpfGerenteParaRemover());

        for (ContaLeitura conta : contasLeituraParaTransferir) {
            conta.setGerente(evento.cpfGerenteDestino());
            conta.setIdSagaRemocaoGerente(evento.sagaId());
            conta.setGerenteAnteriorRemocao(evento.cpfGerenteParaRemover());
            contaLeituraRepository.save(conta);
        }

        enviarResposta(
            evento.sagaId(),
            OPERACAO_TRANSFERIR,
            contasParaTransferir.size(),
            true,
            "Contas transferidas com sucesso"
        );
    }

    private void compensarTransferencia(EventoTransferenciaContasRemocao evento) {
        List<ContaEscrita> contasParaCompensar = contaEscritaRepository
            .findByIdSagaRemocaoGerente(evento.sagaId());

        for (ContaEscrita conta : contasParaCompensar) {
            conta.setGerente(gerenteOriginal(conta.getGerenteAnteriorRemocao(), evento.cpfGerenteParaRemover()));
            contaEscritaRepository.save(conta);
        }

        List<ContaLeitura> contasLeituraParaCompensar = contaLeituraRepository
            .findByIdSagaRemocaoGerente(evento.sagaId());

        for (ContaLeitura conta : contasLeituraParaCompensar) {
            conta.setGerente(gerenteOriginal(conta.getGerenteAnteriorRemocao(), evento.cpfGerenteParaRemover()));
            contaLeituraRepository.save(conta);
        }

        enviarResposta(
            evento.sagaId(),
            OPERACAO_COMPENSAR,
            contasParaCompensar.size(),
            true,
            "Transferencia de contas compensada"
        );
    }

    private void enviarResposta(
        String sagaId,
        String operacao,
        int totalContasTransferidas,
        boolean sucesso,
        String mensagem
    ) {
        EventoRespostaTransferenciaContas resposta = new EventoRespostaTransferenciaContas(
            sagaId,
            operacao,
            totalContasTransferidas,
            sucesso,
            mensagem
        );

        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_RESPOSTA_TRANSFERENCIA_CONTAS,
            resposta
        );
    }

    private String normalizarOperacao(String operacao) {
        if (operacao == null || operacao.isBlank()) {
            return OPERACAO_TRANSFERIR;
        }

        return operacao.toUpperCase();
    }

    private String gerenteOriginal(String gerenteAnterior, String gerenteFallback) {
        if (gerenteAnterior == null || gerenteAnterior.isBlank()) {
            return gerenteFallback;
        }

        return gerenteAnterior;
    }
}
