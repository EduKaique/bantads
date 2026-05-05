package com.bantads.cliente.mensageria.aprovacao;

public record ComandoCriacaoAcessoAprovacao(
    String idSaga,
    String cpfCliente,
    String nomeCliente,
    String emailCliente
) {
}
