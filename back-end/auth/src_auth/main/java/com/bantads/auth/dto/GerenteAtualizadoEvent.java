package com.bantads.auth.dto;

import java.io.Serializable;

public record GerenteAtualizadoEvent(
    String cpf,
    String nome,
    String email,
    String senha
) implements Serializable {}
