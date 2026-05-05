package com.bantads.cliente.mensageria.aprovacao;

public record ComandoCompensacaoContaAprovacao(
    String idSaga,
    String cpfCliente,
    String numeroConta,
    String motivo
) {
}
