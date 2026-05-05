package com.bantads.cliente.dto;

import com.bantads.cliente.model.SagaAprovacaoCliente;
import com.bantads.cliente.model.StatusSagaAprovacaoCliente;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class RespostaAprovacaoClienteDTO {

    private String idSaga;
    private String cpfCliente;
    private StatusSagaAprovacaoCliente status;
    private String mensagem;
    private String numeroConta;
    private OffsetDateTime iniciadaEm;
    private OffsetDateTime atualizadaEm;

    public static RespostaAprovacaoClienteDTO deEntidade(SagaAprovacaoCliente saga) {
        RespostaAprovacaoClienteDTO dto = new RespostaAprovacaoClienteDTO();
        dto.setIdSaga(saga.getIdSaga());
        dto.setCpfCliente(saga.getCpfCliente());
        dto.setStatus(saga.getStatus());
        dto.setMensagem(resolverMensagem(saga));
        dto.setNumeroConta(saga.getNumeroConta());
        dto.setIniciadaEm(saga.getCriadaEm());
        dto.setAtualizadaEm(saga.getAtualizadaEm());
        return dto;
    }

    private static String resolverMensagem(SagaAprovacaoCliente saga) {
        if (saga.getMensagemErro() != null && !saga.getMensagemErro().isBlank()) {
            return saga.getMensagemErro();
        }

        return switch (saga.getStatus()) {
            case CONCLUIDA -> "Aprovacao concluida.";
            case FALHOU -> "Aprovacao falhou.";
            case COMPENSANDO -> "Aprovacao em compensacao.";
            default -> "Aprovacao em processamento.";
        };
    }
}
