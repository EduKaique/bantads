package com.bantads.cliente.service;

import com.bantads.cliente.dto.*;

import java.util.List;

public interface ClienteService {

    void autocadastrar(AutocadastroInfoDTO dto);

    ClienteResponseDTO buscarPorCpf(String cpf);

    List<ClienteParaAprovarResponseDTO> listarParaAprovar();

    List<ClienteResponseDTO> listarTodos();

    void alterarPerfil(String cpf, PerfilInfoDTO dto);

    void aprovar(String cpf);

    void rejeitar(String cpf);
}