package com.bantads.cliente.mensageria.aprovacao;

public record ComandoCompensacaoAcessoAprovacao(
    String idSaga,
    String cpfCliente,
    String emailCliente,
    String motivo
) {
}
