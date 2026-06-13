package com.bantads.cliente.service;

import com.bantads.cliente.dto.*;

import java.util.List;

public interface ClienteService {

    ClienteResponseDTO autocadastrar(AutocadastroInfoDTO dto);

    ClienteResponseDTO buscarPorCpf(String cpf, String cpfUsuario, String tipoUsuario);

    List<ClienteParaAprovarResponseDTO> listarParaAprovar(String cpfGerenteSolicitante, String tipoUsuario, String cpfGerenteFiltro);

    List<ClienteResponseDTO> listarTodos();

    List<ClienteResponseDTO> listarRelatorioAdministrativo(String tipoUsuario);

    void alterarPerfil(String cpf, PerfilInfoDTO dto);

    RespostaAprovacaoClienteDTO aprovar(String cpf, String cpfGerenteSolicitante, String tipoUsuario);

    RespostaAprovacaoClienteDTO consultarAprovacao(String idSaga, String cpfGerenteSolicitante, String tipoUsuario);

    void rejeitar(String cpf, MotivoRejeicaoDTO motivo);
}
