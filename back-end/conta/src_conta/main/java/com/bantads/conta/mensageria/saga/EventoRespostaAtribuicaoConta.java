package com.bantads.conta.mensageria.saga;

public record EventoRespostaAtribuicaoConta(
    String sagaId,
    String cpfNovoGerente,
    boolean sucesso,
    String mensagem
) {}
