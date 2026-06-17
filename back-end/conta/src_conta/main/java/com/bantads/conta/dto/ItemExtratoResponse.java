package com.bantads.conta.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ItemExtratoResponse(
    OffsetDateTime data,
    String tipo,
    String origem,
    String destino,
    BigDecimal valor
) {
}
