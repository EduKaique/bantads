package com.bantads.cliente.mensageria.remocaogerente;

public record EventoTransferenciaContasRemocao(
    String sagaId,
    String cpfGerenteParaRemover,
    String cpfGerenteDestino,
    String operacao,
    boolean sucesso,
    String mensagem
) {}