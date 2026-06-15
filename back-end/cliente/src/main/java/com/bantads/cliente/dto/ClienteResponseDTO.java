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
    private Double limite;
    private String gerente;
    private String conta;
    private Double saldo;
    
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;

    public static ClienteResponseDTO fromEntity(Cliente c) {
        return fromEntity(c, true); 
    }

    public static ClienteResponseDTO fromEntity(Cliente c, boolean incluirSalario) {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setCpf(c.getCpf());
        dto.setNome(c.getNome());
        dto.setEmail(c.getEmail());
        dto.setTelefone(c.getTelefone());
        
        if (c.getSalario() != null) {
            if (incluirSalario) {
                dto.setSalario(c.getSalario());
            }
            
            if (c.getSalario() >= 2000.0) {
                dto.setLimite(c.getSalario() / 2.0);
            } else {
                dto.setLimite(0.0);
            }
        }
        dto.setGerente(c.getCpfGerenteResponsavel());
        dto.setConta(c.getConta());
        dto.setSaldo(0.0);
        
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