package com.bantads.conta.mensageria;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record EventoMovimentacaoConta(
    String conta,
    String cliente,
    String gerente,
    BigDecimal limite,
    BigDecimal saldo,
    OffsetDateTime criacaoConta,
    OffsetDateTime dataMovimentacao,
    TipoMovimentacao tipo,
    String origem,
    String destino,
    BigDecimal valor
) {
}
