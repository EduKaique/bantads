package com.bantads.conta.mensageria;

import java.io.Serializable;

public record ClienteAtualizadoEvent(
        String cpf,
        String nome,
        String email,
        Double salario
) implements Serializable {}