package com.bantads.auth.dto;

import java.io.Serializable;

public class AutocadastroInfoDTO implements Serializable {
    private String cpf;
    private String nome;
    private String email;
    private String senha;

    public String getCpf() { return cpf; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }

    public void setCpf(String cpf) { this.cpf = cpf; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setSenha(String senha) { this.senha = senha; }
}