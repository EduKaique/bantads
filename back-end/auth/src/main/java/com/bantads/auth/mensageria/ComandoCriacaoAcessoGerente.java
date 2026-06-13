package com.bantads.auth.mensageria;

public record ComandoCriacaoAcessoGerente(
    String cpf, 
    String nome, 
    String email, 
    String senha, 
    String tipo
) {}