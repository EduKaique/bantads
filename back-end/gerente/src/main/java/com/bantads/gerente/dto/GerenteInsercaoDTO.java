package com.bantads.gerente.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GerenteInsercaoDTO {

    @NotBlank
    private String cpf;

    @NotBlank
    private String nome;

    @NotBlank
    @Email
    private String email;

    private String tipo;

    private String senha;
}
