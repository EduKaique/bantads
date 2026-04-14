package com.bantads.conta.dto;

import java.math.BigDecimal;
import java.util.List;

public record ExtratoResponse(
    String conta,
    BigDecimal saldo,
    List<ItemExtratoResponse> movimentacoes
) {
}
