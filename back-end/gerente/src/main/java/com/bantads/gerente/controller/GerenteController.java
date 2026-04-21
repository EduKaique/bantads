package com.bantads.gerente.controller;

import com.bantads.gerente.dto.GerenteAtualizacaoDTO;
import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;
import com.bantads.gerente.service.GerenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gerentes")
@Tag(name = "Gerentes", description = "CRUD de gerentes")
public class GerenteController {

    private final GerenteService service;

    public GerenteController(GerenteService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Busca todos os gerentes cadastrados")
    public ResponseEntity<List<GerenteResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{cpf}")
    @Operation(summary = "Consulta um gerente pelo CPF")
    public ResponseEntity<GerenteResponseDTO> buscarPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(service.buscarPorCpf(cpf));
    }

    @PostMapping
    @Operation(summary = "Insere um novo gerente")
    public ResponseEntity<GerenteResponseDTO> inserir(@Valid @RequestBody GerenteInsercaoDTO dto) {
        GerenteResponseDTO response = service.inserir(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{cpf}")
    @Operation(summary = "Atualiza os dados de um gerente")
    public ResponseEntity<GerenteResponseDTO> atualizar(
            @PathVariable String cpf,
            @Valid @RequestBody GerenteAtualizacaoDTO dto) {
        return ResponseEntity.ok(service.atualizar(cpf, dto));
    }

    @DeleteMapping("/{cpf}")
    @Operation(summary = "Remove um gerente pelo CPF")
    public ResponseEntity<GerenteResponseDTO> remover(@PathVariable String cpf) {
        return ResponseEntity.ok(service.remover(cpf));
    }
}
