package com.bantads.gerente.mensageria;

import java.math.BigDecimal;

public record EventoRespostaGerenteMenosContas(
    String sagaId,
    String cpfGerenteMenosContas,
    int quantidadeContas,
    BigDecimal saldoTotal,
    boolean sucesso,
    String mensagem
) {}
