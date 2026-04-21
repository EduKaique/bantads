package com.bantads.gerente.dto;

import jakarta.validation.constraints.Email;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GerenteAtualizacaoDTO {
    private String nome;

    @Email
    private String email;

    private String senha;
}
