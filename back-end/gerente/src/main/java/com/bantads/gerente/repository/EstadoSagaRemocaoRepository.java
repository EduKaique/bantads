package com.bantads.gerente.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bantads.gerente.mensageria.EstadoSagaRemocao;

@Repository
public interface EstadoSagaRemocaoRepository extends JpaRepository<EstadoSagaRemocao, String> {
}
