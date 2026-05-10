package com.bantads.gerente.mensageria;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EstadoSagaRemocao {

    private String sagaId;
    private String cpfGerenteParaRemover;
    private String status;
    private String cpfGerenteMenosContas;
    private int quantidadeContasTransferidas;
    private long dataInicio;
    private String mensagem;
}
