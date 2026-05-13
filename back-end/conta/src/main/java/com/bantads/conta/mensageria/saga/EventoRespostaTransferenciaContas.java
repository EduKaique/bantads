package com.bantads.conta.mensageria.saga;

public record EventoRespostaTransferenciaContas(
    String sagaId,
    int totalContasTransferidas,
    boolean sucesso,
    String mensagem
) {}
