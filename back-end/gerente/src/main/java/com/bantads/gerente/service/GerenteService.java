package com.bantads.gerente.service;

import com.bantads.gerente.dto.GerenteAtualizacaoDTO;
import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;

import java.util.List;

public interface GerenteService {

    List<GerenteResponseDTO> listarTodos();

    GerenteResponseDTO buscarPorCpf(String cpf);

    GerenteResponseDTO inserir(GerenteInsercaoDTO dto);

    GerenteResponseDTO atualizar(String cpf, GerenteAtualizacaoDTO dto);

    GerenteResponseDTO remover(String cpf);
}
