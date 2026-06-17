package com.bantads.conta.mensageria.saga;

public record EventoSolicitacaoAtribuicaoConta(
    String sagaId,
    String cpfNovoGerente,
    String cpfGerenteOrigem,
    boolean sucesso,
    String mensagem
) {}
