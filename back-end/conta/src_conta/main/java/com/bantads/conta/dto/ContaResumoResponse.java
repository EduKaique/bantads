package com.bantads.conta.dto;

import java.math.BigDecimal;

public record ContaResumoResponse(
    String accountNumber,
    String holderDocument,
    BigDecimal availableBalance,
    BigDecimal limit,
    String managerDocument
) {
}
