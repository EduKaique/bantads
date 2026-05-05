package com.bantads.cliente.mensageria.aprovacao;

import java.math.BigDecimal;

public record ComandoCriacaoContaAprovacao(
    String idSaga,
    String cpfCliente,
    String cpfGerenteResponsavel,
    BigDecimal salario,
    BigDecimal saldoInicial,
    String emailCliente
) {
}
