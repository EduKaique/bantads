package com.bantads.cliente.repository;

import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.model.StatusCliente;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, String> {
    List<Cliente> findByStatusOrderByNomeAsc(StatusCliente status);

    List<Cliente> findByStatusAndCpfGerenteResponsavel(StatusCliente status, String cpfGerenteResponsavel);

    boolean existsByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select cliente from Cliente cliente where cliente.cpf = :cpf")
    Optional<Cliente> findByCpfParaAtualizar(@Param("cpf") String cpf);
}
