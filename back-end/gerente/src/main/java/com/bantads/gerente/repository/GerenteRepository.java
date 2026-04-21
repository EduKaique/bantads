package com.bantads.gerente.repository;

import com.bantads.gerente.model.Gerente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GerenteRepository extends JpaRepository<Gerente, String> {

    Optional<Gerente> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    void deleteByCpf(String cpf);
}
