package com.bantads.auth.dto;

import java.io.Serializable;

public record ClienteAtualizadoEvent(
        String cpf,
        String nome,
        String email,
        Double salario
) implements Serializable {}