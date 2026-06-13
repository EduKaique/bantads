package com.bantads.cliente.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "aprovacao_cliente_saga")
public class SagaAprovacaoCliente {

    @Id
    @Column(length = 36, nullable = false)
    private String idSaga;

    @Column(nullable = false, length = 11)
    private String cpfCliente;

    @Column(nullable = false, length = 11)
    private String cpfGerenteSolicitante;

    @Column(nullable = false, length = 11)
    private String cpfGerenteResponsavel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSagaAprovacaoCliente status;

    private String etapaAtual;

    @Column(length = 4)
    private String numeroConta;

    @Column
    private Double saldo = 0.0;

    @Column
    private Double limite;

    private Boolean contaCriadaPelaSaga = Boolean.FALSE;

    private Boolean acessoCriadoPelaSaga = Boolean.FALSE;

    private String emailCliente;

    private String mensagemErro;

    @Column(nullable = false)
    private OffsetDateTime criadaEm;

    @Column(nullable = false)
    private OffsetDateTime atualizadaEm;

    private OffsetDateTime finalizadaEm;

    @PrePersist
    public void prepararCriacao() {
        OffsetDateTime agora = OffsetDateTime.now();
        if (criadaEm == null) {
            criadaEm = agora;
        }
        atualizadaEm = agora;
    }

    @PreUpdate
    public void atualizarData() {
        atualizadaEm = OffsetDateTime.now();
    }
}
