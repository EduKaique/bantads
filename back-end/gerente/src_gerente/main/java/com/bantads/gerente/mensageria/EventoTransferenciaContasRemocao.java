package com.bantads.gerente.mensageria;

public record EventoTransferenciaContasRemocao(
    String sagaId,
    String cpfGerenteParaRemover,
    String cpfGerenteDestino,
    String operacao,
    boolean sucesso,
    String mensagem
) {}
