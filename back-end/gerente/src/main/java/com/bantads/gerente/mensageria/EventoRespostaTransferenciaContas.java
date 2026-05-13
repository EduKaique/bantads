package com.bantads.gerente.mensageria;

public record EventoRespostaTransferenciaContas(
    String sagaId,
    int totalContasTransferidas,
    boolean sucesso,
    String mensagem
) {}
