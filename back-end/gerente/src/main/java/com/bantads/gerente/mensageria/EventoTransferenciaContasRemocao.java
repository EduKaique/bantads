package com.bantads.gerente.mensageria;

public record EventoTransferenciaContasRemocao(
    String sagaId,
    String cpfGerenteParaRemover,
    String cpfGerenteDestino,
    boolean sucesso,
    String mensagem
) {}
