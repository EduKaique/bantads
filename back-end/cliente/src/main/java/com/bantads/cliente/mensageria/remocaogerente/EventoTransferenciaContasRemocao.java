package com.bantads.cliente.mensageria.remocaogerente;

public record EventoTransferenciaContasRemocao(
    String sagaId,
    String cpfGerenteParaRemover,
    String cpfGerenteMenosContas,
    boolean sucesso,
    String mensagem
) {}