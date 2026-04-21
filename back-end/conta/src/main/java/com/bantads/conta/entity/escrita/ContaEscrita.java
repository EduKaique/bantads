package com.bantads.conta.entity.escrita;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "conta", schema = "ms_conta_cud")
public class ContaEscrita {

    @Id
    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(nullable = false, length = 14)
    private String cliente;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal saldo;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal limite;

    @Column(nullable = false, length = 14)
    private String gerente;

    @Column(nullable = false)
    private OffsetDateTime criacao;

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public BigDecimal getLimite() {
        return limite;
    }

    public void setLimite(BigDecimal limite) {
        this.limite = limite;
    }

    public String getGerente() {
        return gerente;
    }

    public void setGerente(String gerente) {
        this.gerente = gerente;
    }

    public OffsetDateTime getCriacao() {
        return criacao;
    }

    public void setCriacao(OffsetDateTime criacao) {
        this.criacao = criacao;
    }
}
