package com.bantads.conta.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "conta", schema = "ms_conta_cud")
public class ContaCommand implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long clienteId;
    private Double saldo;
    private Double limite;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Double getSaldo() { return saldo; }
    public void setSaldo(Double saldo) { this.saldo = saldo; }

    public Double getLimite() { return limite; }
    public void setLimite(Double limite) { this.limite = limite; }
}