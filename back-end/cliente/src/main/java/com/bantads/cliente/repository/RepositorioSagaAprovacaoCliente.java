package com.bantads.cliente.repository;

import com.bantads.cliente.model.SagaAprovacaoCliente;
import com.bantads.cliente.model.StatusSagaAprovacaoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioSagaAprovacaoCliente extends JpaRepository<SagaAprovacaoCliente, String> {

    Optional<SagaAprovacaoCliente> findFirstByCpfClienteAndStatusInOrderByCriadaEmDesc(
        String cpfCliente,
        Collection<StatusSagaAprovacaoCliente> status
    );

    Optional<SagaAprovacaoCliente> findFirstByCpfClienteOrderByCriadaEmDesc(String cpfCliente);

    List<SagaAprovacaoCliente> findByStatusInAndAtualizadaEmBefore(
        Collection<StatusSagaAprovacaoCliente> status,
        OffsetDateTime atualizadaEm
    );
}
