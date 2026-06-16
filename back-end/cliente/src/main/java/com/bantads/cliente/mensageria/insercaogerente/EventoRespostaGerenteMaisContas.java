package com.bantads.cliente.mensageria.insercaogerente;

import java.math.BigDecimal;

public record EventoRespostaGerenteMaisContas(
    String sagaId,
    String cpfGerenteComMaisContas,
    int quantidadeContas,
    BigDecimal menorSaldoPositivo,
    boolean sucesso,
    String mensagem
) {}
