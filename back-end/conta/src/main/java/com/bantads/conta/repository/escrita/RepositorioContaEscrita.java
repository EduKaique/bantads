package com.bantads.conta.repository.escrita;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bantads.conta.entity.escrita.ContaEscrita;

public interface RepositorioContaEscrita extends JpaRepository<ContaEscrita, String> {
}
