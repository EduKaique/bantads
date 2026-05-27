package com.bantads.cliente.service;

import com.bantads.cliente.dto.*;

import java.util.List;

public interface ClienteService {

    void autocadastrar(AutocadastroInfoDTO dto);

    ClienteResponseDTO buscarPorCpf(String cpf);

    List<ClienteParaAprovarResponseDTO> listarParaAprovar(String cpfGerenteSolicitante, String tipoUsuario, String cpfGerenteFiltro);

    List<ClienteResponseDTO> listarTodos();

    List<ClienteResponseDTO> listarTodos(boolean incluirSalario);

    void alterarPerfil(String cpf, PerfilInfoDTO dto);

    RespostaAprovacaoClienteDTO aprovar(String cpf, String cpfGerenteSolicitante, String tipoUsuario);

    RespostaAprovacaoClienteDTO consultarAprovacao(String idSaga, String cpfGerenteSolicitante, String tipoUsuario);

    void rejeitar(String cpf, MotivoRejeicaoDTO motivo);
}
