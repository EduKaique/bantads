package com.bantads.auth.mensageria.aprovacao;

public record ComandoCompensacaoAcessoAprovacao(
    String idSaga,
    String cpfCliente,
    String emailCliente,
    String motivo
) {
}
