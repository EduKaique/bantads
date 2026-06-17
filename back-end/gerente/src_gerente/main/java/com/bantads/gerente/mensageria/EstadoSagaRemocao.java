package com.bantads.gerente.mensageria;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "saga_remocao_gerente", schema = "ms_gerente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EstadoSagaRemocao {

    @Id
    @Column(name = "saga_id", length = 36, nullable = false)
    private String sagaId;

    @Column(length = 11, nullable = false)
    private String cpfGerenteParaRemover;

    @Column(length = 60, nullable = false)
    private String status;

    @Column(length = 11)
    private String cpfGerenteMenosContas;

    private int quantidadeContasTransferidas;

    @Column(nullable = false)
    private long dataInicio;

    @Column(length = 1000)
    private String mensagem;
}
