package com.bantads.gerente.mensageria;

import com.bantads.gerente.dto.GerenteInsercaoDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EstadoSagaInsercao {

    private String sagaId;
    private GerenteInsercaoDTO dto;
    private String status; // INICIADA, GERENTE_CONSULTADO, GERENTE_INSERIDO, AGUARDANDO_ATRIBUICAO_CONTA, CONCLUIDA, ERRO
    private String cpfGerenteComMaisContas;
    private String cpfNovoGerente;
    private int quantidadeContasGerenteOrigem;
    private boolean deveAtribuirConta;
    private long dataInicio;
    private String mensagem;
}
