package com.bantads.conta.mensageria.saga;

/**
 * Evento para solicitar transferência de contas durante remoção de gerente
 */
public record EventoTransferenciaContasRemocao(
    String sagaId,
    String cpfGerenteParaRemover,
    String cpfGerenteDestino,
    boolean sucesso,
    String mensagem
) {}
