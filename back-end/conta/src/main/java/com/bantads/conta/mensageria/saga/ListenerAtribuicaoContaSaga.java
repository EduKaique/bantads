package com.bantads.conta.mensageria.saga;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.entity.escrita.ContaEscrita;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;

@Component
public class ListenerAtribuicaoContaSaga {

    private final RepositorioContaEscrita repositorioContaEscrita;
    private final RabbitTemplate rabbitTemplate;

    public ListenerAtribuicaoContaSaga(
        RepositorioContaEscrita repositorioContaEscrita,
        RabbitTemplate rabbitTemplate
    ) {
        this.repositorioContaEscrita = repositorioContaEscrita;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_ATRIBUIR_CONTA)
    @Transactional
    public void consumirSolicitacaoAtribuicaoConta(EventoSolicitacaoAtribuicaoConta evento) {
        System.out.println("Solicitação atribuição conta recebida: " + evento.sagaId());

        try {
            List<ContaEscrita> contasGerenteOrigem = repositorioContaEscrita.findAll()
                .stream()
                .filter(c -> c.getGerente().equals(evento.cpfGerenteOrigem()))
                .toList();

            if (contasGerenteOrigem.isEmpty()) {
                enviarRespostaErro(evento.sagaId(), evento.cpfNovoGerente(),
                    "Gerente de origem não possui contas");
                return;
            }

            ContaEscrita contaParaTransferir = contasGerenteOrigem.get(0);
            contaParaTransferir.setGerente(evento.cpfNovoGerente());
            repositorioContaEscrita.save(contaParaTransferir);

            EventoRespostaAtribuicaoConta resposta = new EventoRespostaAtribuicaoConta(
                evento.sagaId(),
                evento.cpfNovoGerente(),
                true,
                "Conta " + contaParaTransferir.getNumero() + " atribuída com sucesso"
            );

            rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
                RabbitMqConfiguracao.CHAVE_RESPOSTA_ATRIBUICAO_CONTA,
                resposta
            );

        } catch (Exception e) {
            System.err.println("Erro ao atribuir conta: " + e.getMessage());
            enviarRespostaErro(evento.sagaId(), evento.cpfNovoGerente(),
                "Erro ao atribuir conta: " + e.getMessage());
        }
    }

    private void enviarRespostaErro(String sagaId, String cpfNovoGerente, String mensagem) {
        EventoRespostaAtribuicaoConta resposta = new EventoRespostaAtribuicaoConta(
            sagaId,
            cpfNovoGerente,
            false,
            mensagem
        );

        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_RESPOSTA_ATRIBUICAO_CONTA,
            resposta
        );
    }
}
