package com.bantads.conta.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TransferenciaResponse(
    String conta,
    OffsetDateTime data,
    String destino,
    BigDecimal saldo,
    BigDecimal valor
) {
}
