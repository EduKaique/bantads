package com.bantads.conta.mensageria.saga;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.entity.escrita.ContaEscrita;
import com.bantads.conta.entity.leitura.ContaLeitura;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import com.bantads.conta.repository.leitura.RepositorioContaLeitura;

import java.util.List;

@Component
public class ListenerTransferenciaContasRemocao {

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
    @Transactional
    public void consumirTransferenciaContasRemocao(EventoTransferenciaContasRemocao evento) {
        System.out.println("Transferência de contas (remoção) recebida: " + evento.sagaId());

        try {
            List<ContaEscrita> contasParaTransferir = contaEscritaRepository
                .findByGerente(evento.cpfGerenteParaRemover());

            if (contasParaTransferir.isEmpty()) {
                enviarResposta(evento.sagaId(), 0, true, "Nenhuma conta para transferir");
                return;
            }

            for (ContaEscrita conta : contasParaTransferir) {
                conta.setGerente(evento.cpfGerenteDestino());
                contaEscritaRepository.save(conta);
            }

            List<ContaLeitura> contasLeituraParaTransferir = contaLeituraRepository
                .findByGerente(evento.cpfGerenteParaRemover());

            for (ContaLeitura conta : contasLeituraParaTransferir) {
                conta.setGerente(evento.cpfGerenteDestino());
                contaLeituraRepository.save(conta);
            }

            enviarResposta(evento.sagaId(), contasParaTransferir.size(), true, "Contas transferidas com sucesso");

        } catch (Exception e) {
            System.err.println("Erro ao transferir contas: " + e.getMessage());
            enviarResposta(evento.sagaId(), 0, false, "Erro ao transferir contas: " + e.getMessage());
        }
    }

    private void enviarResposta(String sagaId, int totalContasTransferidas, boolean sucesso, String mensagem) {
        EventoRespostaTransferenciaContas resposta = new EventoRespostaTransferenciaContas(
            sagaId,
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
}
