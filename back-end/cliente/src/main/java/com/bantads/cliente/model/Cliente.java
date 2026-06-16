package com.bantads.cliente.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @Column(name = "cpf", length = 11, nullable = false)
    private String cpf;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    private String telefone;

    private Double salario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCliente status;

    @Column(length = 11)
    private String cpfGerenteResponsavel;

    @Column(length = 20)
    private String conta;

    private OffsetDateTime dataSolicitacao;

    private String endereco;
    private String cep;
    private String cidade;
    private String estado;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;

    @PrePersist
    public void prepararCadastro() {
        if (dataSolicitacao == null) {
            dataSolicitacao = OffsetDateTime.now();
        }
    }
}