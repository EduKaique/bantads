package com.bantads.conta.mensageria;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.service.ServicoContaEscrita;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ConsumidorClienteAtualizado {

    private final ServicoContaEscrita servicoContaEscrita;

    public ConsumidorClienteAtualizado(ServicoContaEscrita servicoContaEscrita) {
        this.servicoContaEscrita = servicoContaEscrita;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_CONTA_CLIENTE_ATUALIZADO)
    public void escutarAlteracaoPerfil(ClienteAtualizadoEvent evento) {
        System.out.println("EVENTO SAGA RECEBIDO NO MS-CONTA");
        System.out.println("CPF: " + evento.cpf() + " | Novo Salário: " + evento.salario());
        
        servicoContaEscrita.atualizarLimiteSaga(evento.cpf(), evento.salario());
    }
}