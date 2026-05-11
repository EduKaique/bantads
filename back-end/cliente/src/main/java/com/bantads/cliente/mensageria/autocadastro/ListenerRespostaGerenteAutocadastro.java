package com.bantads.cliente.mensageria.autocadastro;

import com.bantads.cliente.config.RabbitMqConfiguracao;
import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.repository.ClienteRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class ListenerRespostaGerenteAutocadastro {

    private final ClienteRepository clienteRepository;

    public ListenerRespostaGerenteAutocadastro(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_RESPOSTA_GERENTE)
    @Transactional
    public void processarAtribuicaoDeGerente(EventoRespostaGerenteAutocadastro evento) {
        System.out.println("SAGA Autocadastro: Recebida resposta para associar gerente " + evento.cpfGerente() + " ao cliente " + evento.cpfCliente());
        
        Optional<Cliente> clienteOpt = clienteRepository.findById(evento.cpfCliente());
        
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            cliente.setCpfGerenteResponsavel(evento.cpfGerente());
            clienteRepository.save(cliente);
            System.out.println("SAGA Autocadastro: Cliente atualizado com sucesso. Agora pendente para este gerente.");
        } else {
            System.err.println("Erro SAGA Autocadastro: Cliente com CPF " + evento.cpfCliente() + " não encontrado.");
        }
    }
}