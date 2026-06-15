package com.bantads.cliente.mensageria.atribuicaoconta;

public record EventoSolicitacaoAtribuicaoConta(
    String sagaId,
    String cpfNovoGerente,
    String cpfGerenteOrigem
) {}