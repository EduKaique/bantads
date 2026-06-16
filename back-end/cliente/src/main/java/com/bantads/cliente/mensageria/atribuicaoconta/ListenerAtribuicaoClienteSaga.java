package com.bantads.cliente.mensageria.atribuicaoconta;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.cliente.config.RabbitMqConfiguracao;
import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.repository.ClienteRepository;

@Component
public class ListenerAtribuicaoClienteSaga {

    private final ClienteRepository clienteRepository;
    private final RabbitTemplate rabbitTemplate;

    public ListenerAtribuicaoClienteSaga(ClienteRepository clienteRepository, RabbitTemplate rabbitTemplate) {
        this.clienteRepository = clienteRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = "cliente.atribuir-conta.queue")
    @Transactional
    public void consumirSolicitacaoAtribuicaoConta(EventoSolicitacaoAtribuicaoConta evento) {
        System.out.println("SAGA Cliente - Solicitação atribuição recebida: " + evento.sagaId());

        try {
            List<Cliente> clientesGerenteOrigem = clienteRepository.findByCpfGerenteResponsavel(evento.cpfGerenteOrigem());

            if (!clientesGerenteOrigem.isEmpty()) {
                Cliente clienteParaTransferir = clientesGerenteOrigem.get(0);
                clienteParaTransferir.setCpfGerenteResponsavel(evento.cpfNovoGerente());
                clienteRepository.save(clienteParaTransferir);

                System.out.println("✅ SAGA Cliente - Cliente " + clienteParaTransferir.getCpf() + " doado com sucesso para " + evento.cpfNovoGerente());
            }

            rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
                RabbitMqConfiguracao.CHAVE_RESPOSTA_ATRIBUICAO_CONTA,
                new EventoRespostaAtribuicaoConta(
                    evento.sagaId(),
                    clientesGerenteOrigem.isEmpty() ? 0 : 1,
                    true,
                    "Atribuição concluída"
                )
            );

        } catch (Exception e) {
            System.err.println("SAGA Cliente - Erro ao atribuir cliente: " + e.getMessage());
            rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
                RabbitMqConfiguracao.CHAVE_RESPOSTA_ATRIBUICAO_CONTA,
                new EventoRespostaAtribuicaoConta(evento.sagaId(), 0, false, e.getMessage())
            );
        }
    }
}
