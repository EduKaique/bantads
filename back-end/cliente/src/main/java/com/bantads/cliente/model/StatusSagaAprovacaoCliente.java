package com.bantads.cliente.model;

public enum StatusSagaAprovacaoCliente {
    INICIADA,
    AGUARDANDO_CONTA,
    CONTA_CRIADA,
    AGUARDANDO_AUTH,
    AUTH_CRIADO,
    COMPENSANDO,
    CONCLUIDA,
    FALHOU
}
