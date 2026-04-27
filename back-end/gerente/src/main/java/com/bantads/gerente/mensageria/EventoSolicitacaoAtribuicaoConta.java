package com.bantads.gerente.mensageria;

public record EventoSolicitacaoAtribuicaoConta(
    String sagaId,
    String cpfNovoGerente,
    String cpfGerenteOrigem,
    boolean sucesso,
    String mensagem
) {}
