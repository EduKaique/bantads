package com.bantads.conta.mensageria.autocadastro;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ListenerSolicitacaoGerenteAutocadastro {

    private final RepositorioContaEscrita repositorioContaEscrita;
    private final RabbitTemplate rabbitTemplate;

    public ListenerSolicitacaoGerenteAutocadastro(
            RepositorioContaEscrita repositorioContaEscrita,
            RabbitTemplate rabbitTemplate) {
        this.repositorioContaEscrita = repositorioContaEscrita;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_SOLICITACAO_GERENTE)
    public void processarSolicitacaoGerente(EventoSolicitacaoGerenteAutocadastro evento) {
        System.out.println("SAGA Autocadastro: Buscando gerente com menos contas para o cliente: " + evento.cpfCliente());

        String cpfGerenteEscolhido = buscarCpfGerenteComMenosContas();

        // Monta o payload de resposta
        EventoRespostaGerenteAutocadastro resposta = new EventoRespostaGerenteAutocadastro(
                evento.cpfCliente(),
                cpfGerenteEscolhido
        );

        // Devolve o evento para o MS Cliente
        rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_AUTOCADASTRO,
                RabbitMqConfiguracao.CHAVE_RESPOSTA_GERENTE,
                resposta
        );
        
        System.out.println("SAGA Autocadastro: Resposta enviada. Gerente escolhido: " + cpfGerenteEscolhido);
    }

    private String buscarCpfGerenteComMenosContas() {
        List<String> gerentes = repositorioContaEscrita.findGerentesOrdenadosPorMenorNumeroDeContas();
        
        if (!gerentes.isEmpty()) {
            return gerentes.get(0); // Pega o primeiro (menor count)
        }
        
       return "00000000000"; // Substitua pelo CPF do Gerente Default inserido no Data.sql, se necessário.
    }
}