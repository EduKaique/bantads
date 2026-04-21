package com.bantads.conta.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransferenciaRequest(
    @NotBlank(message = "A conta de destino é obrigatória.")
    String destino,

    @NotNull(message = "O valor é obrigatório.")
    @Positive(message = "O valor deve ser maior que zero.")
    BigDecimal valor
) {
}
