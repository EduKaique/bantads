package com.bantads.conta.mensageria;

public enum TipoMovimentacao {
    DEPOSITO("depósito"),
    SAQUE("saque"),
    TRANSFERENCIA("transferência");

    private final String descricao;

    TipoMovimentacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
