package com.bantads.gerente.mensageria;

public record EventoRespostaAtribuicaoConta(
    String sagaId,
    String cpfNovoGerente,
    boolean sucesso,
    String mensagem
) {}
