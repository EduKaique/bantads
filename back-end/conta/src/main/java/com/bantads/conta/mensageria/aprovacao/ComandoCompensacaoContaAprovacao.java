package com.bantads.conta.mensageria.aprovacao;

public record ComandoCompensacaoContaAprovacao(
    String idSaga,
    String cpfCliente,
    String numeroConta,
    String motivo
) {
}
