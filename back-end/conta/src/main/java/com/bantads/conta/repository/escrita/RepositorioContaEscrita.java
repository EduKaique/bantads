package com.bantads.conta.repository.escrita;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bantads.conta.entity.escrita.ContaEscrita;


import java.util.Optional;

public interface RepositorioContaEscrita extends JpaRepository<ContaEscrita, String> {
    Optional<ContaEscrita> findByCliente(String cliente);
}
