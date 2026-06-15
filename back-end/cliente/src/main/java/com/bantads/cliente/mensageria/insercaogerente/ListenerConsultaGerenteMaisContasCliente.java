package com.bantads.cliente.mensageria.insercaogerente;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.bantads.cliente.config.RabbitMqConfiguracao;
import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.repository.ClienteRepository;

@Component
public class ListenerConsultaGerenteMaisContasCliente {

    private final ClienteRepository clienteRepository;
    private final RabbitTemplate rabbitTemplate;

    public ListenerConsultaGerenteMaisContasCliente(
        ClienteRepository clienteRepository,
        RabbitTemplate rabbitTemplate
    ) {
        this.clienteRepository = clienteRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CONSULTAR_GERENTE_MAIS_CONTAS_CLIENTE)
    public void consumir(EventoConsultaGerenteMaisContas evento) {
        System.out.println("SAGA Cliente - Consultando gerente com mais clientes: " + evento.sagaId());

        List<Cliente> todos = clienteRepository.findAll();

        Map<String, Long> contagemPorGerente = todos.stream()
            .filter(c -> c.getCpfGerenteResponsavel() != null)
            .collect(Collectors.groupingBy(Cliente::getCpfGerenteResponsavel, Collectors.counting()));

        EventoRespostaGerenteMaisContas resposta;

        if (contagemPorGerente.isEmpty()) {
            resposta = new EventoRespostaGerenteMaisContas(
                evento.sagaId(), "", 0, BigDecimal.ZERO, true, "Nenhum cliente cadastrado");
        } else {
            Map.Entry<String, Long> vencedor = contagemPorGerente.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .get();

            resposta = new EventoRespostaGerenteMaisContas(
                evento.sagaId(),
                vencedor.getKey(),
                vencedor.getValue().intValue(),
                BigDecimal.ZERO,
                true,
                "Gerente com mais clientes encontrado"
            );
            System.out.println("✅ SAGA Cliente - Gerente com mais clientes: " + vencedor.getKey() + " (" + vencedor.getValue() + " clientes)");
        }

        rabbitTemplate.convertAndSend(
            RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
            RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE_MAIS_CONTAS,
            resposta
        );
    }
}
