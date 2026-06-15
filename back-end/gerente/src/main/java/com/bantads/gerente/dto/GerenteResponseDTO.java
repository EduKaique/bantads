package com.bantads.gerente.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GerenteResponseDTO {
    private String cpf;
    private String nome;
    private String email;
    private String tipo;

    public String getTipo() {
        return this.tipo != null ? this.tipo.toUpperCase() : null;
    }
}
