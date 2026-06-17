package com.bantads.conta.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record OperacaoResponse(
    String conta,
    OffsetDateTime data,
    BigDecimal saldo
) {
}
