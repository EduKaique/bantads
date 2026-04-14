package com.bantads.conta.repository.leitura;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bantads.conta.entity.leitura.ContaLeitura;

public interface RepositorioContaLeitura extends JpaRepository<ContaLeitura, String> {

    Optional<ContaLeitura> findByCliente(String cliente);
}
