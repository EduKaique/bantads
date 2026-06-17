package com.bantads.gerente.mensageria;

public record EventoRespostaGerenteMaisContas(
    String sagaId,
    String cpfGerenteComMaisContas,
    int quantidadeContas,
    java.math.BigDecimal menorSaldoPositivo,
    boolean sucesso,
    String mensagem
) {}
