package com.bantads.cliente.dto;

import com.bantads.cliente.model.SagaAprovacaoCliente;
import lombok.Data;

import java.time.format.DateTimeFormatter;

@Data
public class ContaResponse {

    private String cliente;
    private String numero;
    private double saldo;
    private double limite;
    private String gerente;
    private String criacao;

    public static ContaResponse deEntidade(SagaAprovacaoCliente saga) {
        ContaResponse dto = new ContaResponse();
        dto.setCliente(saga.getCpfCliente());
        dto.setNumero(saga.getNumeroConta());
        dto.setSaldo(saga.getSaldo() != null ? saga.getSaldo() : 0.0);
        dto.setLimite(saga.getLimite() != null ? saga.getLimite() : 0.0);
        dto.setGerente(saga.getCpfGerenteResponsavel());
        dto.setCriacao(saga.getCriadaEm().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        return dto;
    }
}
