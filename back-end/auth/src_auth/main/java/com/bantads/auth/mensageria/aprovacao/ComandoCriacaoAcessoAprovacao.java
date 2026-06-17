package com.bantads.auth.mensageria.aprovacao;

public record ComandoCriacaoAcessoAprovacao(
    String idSaga,
    String cpfCliente,
    String nomeCliente,
    String emailCliente
) {
}
