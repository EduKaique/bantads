package com.bantads.cliente.repository;

import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.model.StatusCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, String> {
    List<Cliente> findByStatus(StatusCliente status);

    boolean existsByEmail(String email);
}