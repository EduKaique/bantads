package com.bantads.conta.dto;

import java.math.BigDecimal;

public record SaldoResponse(
    String cliente,
    String conta,
    BigDecimal saldo
) {
}
