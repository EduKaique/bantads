package com.bantads.gerente.mensageria;

import java.math.BigDecimal;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.gerente.config.RabbitMqConfiguracao;
import com.bantads.gerente.model.Gerente;
import com.bantads.gerente.repository.GerenteRepository;

@Component
public class ListenerConsultaGerenteMaisContas {

    private final GerenteRepository gerenteRepository;
    private final RabbitTemplate rabbitTemplate;

    public ListenerConsultaGerenteMaisContas(
        GerenteRepository gerenteRepository,
        RabbitTemplate rabbitTemplate
    ) {
        this.gerenteRepository = gerenteRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CONSULTAR_GERENTE_MAIS_CONTAS)
    public void consumirConsultaGerenteMaisContas(EventoConsultaGerenteMaisContas evento) {
        System.out.println("Consulta gerente com mais contas recebida: " + evento.sagaId());

        try {
            long totalGerentes = gerenteRepository.count();

            if (totalGerentes == 0) {
                EventoRespostaGerenteMaisContas resposta = new EventoRespostaGerenteMaisContas(
                    evento.sagaId(),
                    "",
                    0,
                    BigDecimal.ZERO,
                    true,
                    "Nenhum gerente existente"
                );
                rabbitTemplate.convertAndSend(
                    RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
                    RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS,
                    resposta
                );
                return;
            }

            Gerente gerente = gerenteRepository.findAll().get(0);

            EventoRespostaGerenteMaisContas resposta = new EventoRespostaGerenteMaisContas(
                evento.sagaId(),
                gerente.getCpf(),
                1,
                BigDecimal.ZERO,
                true,
                "Gerente com mais contas encontrado"
            );

            rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
                RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS,
                resposta
            );
        } catch (Exception e) {
            System.err.println("Erro ao consultar gerente com mais contas: " + e.getMessage());
            enviarRespostaErro(evento.sagaId(), "Erro ao consultar gerente: " + e.getMessage());
        }
    }

    private void enviarRespostaErro(String sagaId, String mensagem) {
        EventoRespostaGerenteMaisContas resposta = new EventoRespostaGerenteMaisContas(
            sagaId,
            "",
            0,
            BigDecimal.ZERO,
            false,
            mensagem
        );

        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS,
            resposta
        );
    }
}
