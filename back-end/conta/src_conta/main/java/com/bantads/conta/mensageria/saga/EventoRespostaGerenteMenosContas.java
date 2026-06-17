package com.bantads.conta.mensageria.saga;

import java.math.BigDecimal;

public record EventoRespostaGerenteMenosContas(
    String sagaId,
    String cpfGerenteMenosContas,
    int quantidadeContas,
    BigDecimal saldoTotal,
    boolean sucesso,
    String mensagem
) {}
