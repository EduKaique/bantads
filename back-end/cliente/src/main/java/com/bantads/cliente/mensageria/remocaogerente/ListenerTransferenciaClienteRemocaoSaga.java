package com.bantads.cliente.mensageria.remocaogerente;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.repository.ClienteRepository;

@Component
public class ListenerTransferenciaClienteRemocaoSaga {

    private final ClienteRepository clienteRepository;

    public ListenerTransferenciaClienteRemocaoSaga(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @RabbitListener(queues = "cliente.transferir-contas-remocao.queue")
    @Transactional
    public void consumirTransferenciaRemocao(EventoTransferenciaContasRemocao evento) {
        if (!"TRANSFERIR".equals(evento.operacao())) return;

        System.out.println("SAGA Cliente (Remoção) - Migrando clientes do gerente " + evento.cpfGerenteParaRemover());

        try {
            List<Cliente> clientesOrfaos = clienteRepository.findByCpfGerenteResponsavel(evento.cpfGerenteParaRemover());

            if (!clientesOrfaos.isEmpty()) {
                for (Cliente cliente : clientesOrfaos) {
                    cliente.setCpfGerenteResponsavel(evento.cpfGerenteDestino());
                }

                clienteRepository.saveAll(clientesOrfaos);

                System.out.println("✅ SAGA Cliente - " + clientesOrfaos.size() + " cliente(s) migrado(s) para " + evento.cpfGerenteDestino());
            }

        } catch (Exception e) {
            System.err.println("SAGA Cliente - Erro ao migrar clientes na remoção: " + e.getMessage());
        }
    }
}