package com.bantads.auth.mensageria.aprovacao;

public record ResultadoAcessoAprovacao(
    String idSaga,
    String cpfCliente,
    String emailCliente,
    boolean sucesso,
    boolean acessoCriado,
    String mensagem
) {
}
