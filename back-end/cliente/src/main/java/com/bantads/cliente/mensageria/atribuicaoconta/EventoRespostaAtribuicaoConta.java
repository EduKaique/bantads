package com.bantads.cliente.mensageria.atribuicaoconta;

public record EventoRespostaAtribuicaoConta(
    String sagaId,
    int totalContasAtribuidas,
    boolean sucesso,
    String mensagem
) {}
