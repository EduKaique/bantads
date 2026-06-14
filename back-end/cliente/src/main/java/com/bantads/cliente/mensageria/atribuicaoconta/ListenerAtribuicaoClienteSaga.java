package com.bantads.cliente.mensageria.atribuicaoconta;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.repository.ClienteRepository;

@Component
public class ListenerAtribuicaoClienteSaga {

    private final ClienteRepository clienteRepository;

    public ListenerAtribuicaoClienteSaga(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
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


        } catch (Exception e) {
            System.err.println("SAGA Cliente - Erro ao atribuir cliente: " + e.getMessage());
        }
    }
}