package com.bantads.gerente.controller;

import com.bantads.gerente.dto.GerenteAtualizacaoDTO;
import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;
import com.bantads.gerente.service.GerenteService;
import com.bantads.gerente.service.SagaGerenteService;
import com.bantads.gerente.service.SagaRemocaoGerenteService;
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
    private final SagaGerenteService sagaService;
    private final SagaRemocaoGerenteService sagaRemocaoService;

    public GerenteController(
            GerenteService service,
            SagaGerenteService sagaService,
            SagaRemocaoGerenteService sagaRemocaoService) {
        this.service = service;
        this.sagaService = sagaService;
        this.sagaRemocaoService = sagaRemocaoService;
    }

    @GetMapping
    @Operation(summary = "Busca todos os gerentes cadastrados ou dashboard")
    public ResponseEntity<?> listar(
            @RequestParam(required = false) String filtro,
            @RequestParam(required = false) String numero) { 
        
        if ("dashboard".equalsIgnoreCase(filtro) || "dashboard".equalsIgnoreCase(numero)) {
            return ResponseEntity.ok(service.listarDashboard());
        }
        
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{cpf}")
    @Operation(summary = "Consulta um gerente pelo CPF")
    public ResponseEntity<GerenteResponseDTO> buscarPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(service.buscarPorCpf(cpf));
    }

    @PostMapping
    @Operation(summary = "Insere um novo gerente usando SAGA")
    public ResponseEntity<GerenteResponseDTO> inserir(@Valid @RequestBody GerenteInsercaoDTO dto) {
        GerenteResponseDTO response = sagaService.iniciarInsercaoGerente(dto);
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
    @Operation(summary = "Remove um gerente pelo CPF usando SAGA")
    public ResponseEntity<Void> remover(@PathVariable String cpf) {
        sagaRemocaoService.iniciarRemocaoGerente(cpf);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }
}
