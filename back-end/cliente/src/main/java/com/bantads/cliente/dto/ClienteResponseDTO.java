package com.bantads.cliente.dto;

import com.bantads.cliente.model.Cliente;
import lombok.Data;

@Data
public class ClienteResponseDTO {

    private String cpf;
    private String nome;
    private String email;
    private String telefone;
    private String endereco;
    private String cidade;
    private String estado;

    public static ClienteResponseDTO fromEntity(Cliente c) {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setCpf(c.getCpf());
        dto.setNome(c.getNome());
        dto.setEmail(c.getEmail());
        dto.setTelefone(c.getTelefone());
        dto.setEndereco(c.getEndereco());
        dto.setCidade(c.getCidade());
        dto.setEstado(c.getEstado());
        return dto;
    }
}