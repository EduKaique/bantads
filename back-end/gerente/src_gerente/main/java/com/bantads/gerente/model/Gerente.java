package com.bantads.gerente.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "gerente", schema = "ms_gerente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gerente {

    @Id
    @Column(length = 11, nullable = false)
    private String cpf;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String tipo;
}
