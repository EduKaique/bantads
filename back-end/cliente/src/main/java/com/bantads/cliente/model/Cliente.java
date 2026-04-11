package com.bantads.cliente.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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

    private String endereco;
    private String cep;
    private String cidade;
    private String estado;
}