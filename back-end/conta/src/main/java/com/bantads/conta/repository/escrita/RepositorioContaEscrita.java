package com.bantads.conta.repository.escrita;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.bantads.conta.entity.escrita.ContaEscrita;

import java.util.List;
import java.util.Optional;

public interface RepositorioContaEscrita extends JpaRepository<ContaEscrita, String> {
    List<ContaEscrita> findByGerente(String cpfGerente);
    Optional<ContaEscrita> findByCliente(String cliente);

    // Consulta para listar gerentes por volume de contas
    @Query("SELECT c.gerente FROM ContaEscrita c GROUP BY c.gerente ORDER BY COUNT(c) ASC")
    List<String> findGerentesOrdenadosPorMenorNumeroDeContas();
}