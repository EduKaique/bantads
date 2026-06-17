package com.bantads.conta.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ContaPerfilResponse(
    String cliente,
    String numero,
    BigDecimal saldo,
    BigDecimal limite,
    String gerente,
    OffsetDateTime criacao
) {
}
