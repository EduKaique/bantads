package com.bantads.cliente.dto;

import com.bantads.cliente.model.Cliente;
import lombok.Data;

@Data
public class ClienteParaAprovarResponseDTO {

    private String cpf;
    private String nome;
    private String email;
    private Double salario;
    
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;

    public static ClienteParaAprovarResponseDTO fromEntity(Cliente c) {
        ClienteParaAprovarResponseDTO dto = new ClienteParaAprovarResponseDTO();
        dto.setCpf(c.getCpf());
        dto.setNome(c.getNome());
        dto.setEmail(c.getEmail());
        dto.setSalario(c.getSalario());
        
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