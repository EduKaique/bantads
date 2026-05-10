package com.bantads.gerente.mensageria;

import java.math.BigDecimal;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.gerente.config.RabbitMqConfiguracao;
import com.bantads.gerente.model.Gerente;
import com.bantads.gerente.repository.GerenteRepository;

@Component
public class ListenerConsultaGerenteMenosContas {

    private final GerenteRepository gerenteRepository;
    private final RabbitTemplate rabbitTemplate;

    public ListenerConsultaGerenteMenosContas(
        GerenteRepository gerenteRepository,
        RabbitTemplate rabbitTemplate
    ) {
        this.gerenteRepository = gerenteRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CONSULTAR_GERENTE_MENOS_CONTAS)
    public void consumirConsultaGerenteMenosContas(EventoConsultaGerenteMenosContas evento) {
        System.out.println("Consulta gerente com menos contas recebida: " + evento.sagaId());

        try {
            long totalGerentes = gerenteRepository.count();

            if (totalGerentes <= 1) {
                enviarRespostaErro(evento.sagaId(), "Não há outro gerente para receber as contas");
                return;
            }

            Gerente gerenteMenosContas = gerenteRepository.findAll()
                .stream()
                .filter(g -> !g.getCpf().equals(evento.cpfGerenteParaRemover()))
                .findFirst()
                .orElse(null);

            if (gerenteMenosContas == null) {
                enviarRespostaErro(evento.sagaId(), "Gerente com menos contas não encontrado");
                return;
            }

            EventoRespostaGerenteMenosContas resposta = new EventoRespostaGerenteMenosContas(
                evento.sagaId(),
                gerenteMenosContas.getCpf(),
                1,
                BigDecimal.ZERO,
                true,
                "Gerente com menos contas encontrado"
            );

            rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_REMOCAO_GERENTE,
                RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE_MENOS_CONTAS,
                resposta
            );
        } catch (Exception e) {
            System.err.println("Erro ao consultar gerente com menos contas: " + e.getMessage());
            enviarRespostaErro(evento.sagaId(), "Erro ao consultar gerente: " + e.getMessage());
        }
    }

    private void enviarRespostaErro(String sagaId, String mensagem) {
        EventoRespostaGerenteMenosContas resposta = new EventoRespostaGerenteMenosContas(
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
}
