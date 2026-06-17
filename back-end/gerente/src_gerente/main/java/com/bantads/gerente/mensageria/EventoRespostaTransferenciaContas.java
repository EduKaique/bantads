package com.bantads.gerente.mensageria;

public record EventoRespostaTransferenciaContas(
    String sagaId,
    String operacao,
    int totalContasTransferidas,
    boolean sucesso,
    String mensagem
) {}
