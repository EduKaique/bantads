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

    /**
     * Consome a solicitação de consulta de gerente com mais contas
     * e retorna a resposta
     */
    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CONSULTAR_GERENTE_MAIS_CONTAS)
    public void consumirConsultaGerenteMaisContas(EventoConsultaGerenteMaisContas evento) {
        System.out.println("Consulta gerente com mais contas recebida: " + evento.sagaId());

        try {
            // Aqui seria necessário consultar o MS Conta para saber quantas contas cada gerente tem
            // Por enquanto, vamos simular uma resposta
            long totalGerentes = gerenteRepository.count();

            // Se não há gerente, retorna erro
            if (totalGerentes == 0) {
                enviarRespostaErro(evento.sagaId(), "Nenhum gerente cadastrado");
                return;
            }

            // Busca o primeiro gerente como exemplo
            // TODO: Implementar lógica real de buscar gerente com mais contas via MS Conta
            Gerente gerente = gerenteRepository.findAll().get(0);

            EventoRespostaGerenteMaisContas resposta = new EventoRespostaGerenteMaisContas(
                evento.sagaId(),
                gerente.getCpf(),
                1, // quantidade de contas (a ser consultado do MS Conta)
                BigDecimal.ZERO, // menor saldo positivo
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
