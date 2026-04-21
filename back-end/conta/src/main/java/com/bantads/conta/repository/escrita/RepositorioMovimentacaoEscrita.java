package com.bantads.conta.repository.escrita;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bantads.conta.entity.escrita.MovimentacaoEscrita;

public interface RepositorioMovimentacaoEscrita extends JpaRepository<MovimentacaoEscrita, Long> {
}
