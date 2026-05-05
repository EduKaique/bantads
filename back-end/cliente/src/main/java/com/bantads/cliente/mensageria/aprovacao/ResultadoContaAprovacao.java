package com.bantads.cliente.mensageria.aprovacao;

import java.math.BigDecimal;

public record ResultadoContaAprovacao(
    String idSaga,
    String cpfCliente,
    boolean sucesso,
    String numeroConta,
    BigDecimal limite,
    boolean contaCriada,
    String mensagem
) {
}
