package com.bantads.conta.mensageria.saga;

public record EventoRespostaTransferenciaContas(
    String sagaId,
    String operacao,
    int totalContasTransferidas,
    boolean sucesso,
    String mensagem
) {}
