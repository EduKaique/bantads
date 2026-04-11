package com.bantads.cliente.dto;

public class PerfilInfoDTO {
    private String nome;
    private String email;
    private Double salario;
    private String endereco;
    private String CEP;
    private String cidade;
    private String estado;

// Getters
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public Double getSalario() { return salario; }
    public String getEndereco() { return endereco; }
    public String getCEP() { return CEP; }
    public String getCidade() { return cidade; }
    public String getEstado() { return estado; }

    // Setters
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setSalario(Double salario) { this.salario = salario; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public void setCEP(String CEP) { this.CEP = CEP; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public void setEstado(String estado) { this.estado = estado; }
}