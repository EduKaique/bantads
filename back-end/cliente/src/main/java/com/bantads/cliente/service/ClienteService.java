package com.bantads.cliente.service;

import java.util.List;

import com.bantads.cliente.dto.AutocadastroInfoDTO;
import com.bantads.cliente.dto.ClienteParaAprovarResponseDTO;
import com.bantads.cliente.dto.ClienteResponseDTO;
import com.bantads.cliente.dto.MotivoRejeicaoDTO;
import com.bantads.cliente.dto.PerfilInfoDTO;
import com.bantads.cliente.dto.RespostaAprovacaoClienteDTO;

public interface ClienteService {

    ClienteResponseDTO autocadastrar(AutocadastroInfoDTO dto);

    ClienteResponseDTO buscarPorCpf(String cpf, String cpfUsuario, String tipoUsuario);

    List<ClienteParaAprovarResponseDTO> listarParaAprovar(String cpfGerenteSolicitante, String tipoUsuario, String cpfGerenteFiltro);

    List<ClienteResponseDTO> listarTodos(String cpfGerenteSolicitante, String tipoUsuario);

    List<ClienteResponseDTO> listarRelatorioAdministrativo(String tipoUsuario);

    List<ClienteResponseDTO> listarMelhoresClientes(String tipoUsuario);

    ClienteResponseDTO alterarPerfil(String cpf, PerfilInfoDTO dto);

    RespostaAprovacaoClienteDTO aprovar(String cpf, String cpfGerenteSolicitante, String tipoUsuario);

    RespostaAprovacaoClienteDTO consultarAprovacao(String idSaga, String cpfGerenteSolicitante, String tipoUsuario);

    void rejeitar(String cpf, MotivoRejeicaoDTO motivo, String cpfGerenteSolicitante, String tipoUsuario);
}
