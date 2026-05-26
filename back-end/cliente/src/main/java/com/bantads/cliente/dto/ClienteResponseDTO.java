package com.bantads.cliente.dto;

import com.bantads.cliente.model.Cliente;
import lombok.Data;

@Data
public class ClienteResponseDTO {

    private String cpf;
    private String nome;
    private String email;
    private String telefone;
    private Double salario;
    
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;

    public static ClienteResponseDTO fromEntity(Cliente c) {
        return fromEntity(c, false);
    }

    public static ClienteResponseDTO fromEntity(Cliente c, boolean incluirSalario) {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setCpf(c.getCpf());
        dto.setNome(c.getNome());
        dto.setEmail(c.getEmail());
        dto.setTelefone(c.getTelefone());

        if (incluirSalario) {
            dto.setSalario(c.getSalario());
        }
        
        dto.setCep(c.getCep());
        dto.setLogradouro(c.getLogradouro());
        dto.setNumero(c.getNumero());
        dto.setComplemento(c.getComplemento());
        dto.setBairro(c.getBairro());
        dto.setCidade(c.getCidade());
        dto.setEstado(c.getEstado());
        
        return dto;
    }
}
