package com.bantads.conta.repository.leitura;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bantads.conta.entity.leitura.ContaLeitura;

public interface RepositorioContaLeitura extends JpaRepository<ContaLeitura, String> {

    List<ContaLeitura> findByGerente(String gerente);

    Optional<ContaLeitura> findByCliente(String cliente);
}
