package com.bantads.conta.dto;

import java.math.BigDecimal;

public record ContaPorCpfResponse(
    String numeroConta,
    BigDecimal saldoDisponivel
) {
}
