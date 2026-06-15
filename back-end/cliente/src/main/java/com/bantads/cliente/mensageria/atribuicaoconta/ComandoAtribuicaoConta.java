package com.bantads.cliente.mensageria.atribuicaoconta;

public record ComandoAtribuicaoConta(
    String sagaId,
    String cpfNovoGerente,
    String cpfGerenteComMaisContas
) {}
