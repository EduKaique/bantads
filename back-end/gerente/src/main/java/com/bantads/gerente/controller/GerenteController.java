package com.bantads.gerente.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bantads.gerente.dto.GerenteAtualizacaoDTO;
import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;
import com.bantads.gerente.mensageria.EstadoSagaInsercao;
import com.bantads.gerente.mensageria.EstadoSagaRemocao;
import com.bantads.gerente.service.GerenteService;
import com.bantads.gerente.service.SagaGerenteService;
import com.bantads.gerente.service.SagaRemocaoGerenteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

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
        String sagaId = sagaService.iniciarInsercaoGerente(dto);

        // Aguarda brevemente a saga para devolver uma resposta mais proxima do estado final.
        long inicio = System.currentTimeMillis();
        EstadoSagaInsercao estado;
        do {
            try { Thread.sleep(200); } catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
            estado = sagaService.consultarStatusSaga(sagaId);
        } while (estado != null
            && !"CONCLUIDA".equals(estado.getStatus())
            && !"ERRO".equals(estado.getStatus())
            && (System.currentTimeMillis() - inicio) < 5000);

        GerenteResponseDTO response = GerenteResponseDTO.builder()
            .cpf(dto.getCpf())
            .nome(dto.getNome())
            .email(dto.getEmail())
            .tipo("GERENTE")
            .telefone(dto.getTelefone())
            .build();

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
    public ResponseEntity<Map<String, String>> remover(@PathVariable String cpf) {
        String sagaId = sagaRemocaoService.iniciarRemocaoGerente(cpf);

        // A remocao depende da transferencia de contas antes de excluir o gerente.
        long inicio = System.currentTimeMillis();
        EstadoSagaRemocao estado = sagaRemocaoService.consultarStatusSaga(sagaId);

        do {
            try { Thread.sleep(200); } catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
        } while (estado != null
            && !"CONCLUIDA".equals(estado.getStatus())
            && !"ERRO".equals(estado.getStatus())
            && (System.currentTimeMillis() - inicio) < 5000);

        if (estado != null && "ERRO".equals(estado.getStatus())) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("sagaId", sagaId, "status", "ERRO"));
        }

        return ResponseEntity.ok(Map.of("sagaId", sagaId, "status", "CONCLUIDA"));
    }

    @GetMapping("/sagas/remocao/{sagaId}")
    @Operation(summary = "Consulta o status da SAGA de remocao de gerente")
    public ResponseEntity<EstadoSagaRemocao> consultarSagaRemocao(@PathVariable String sagaId) {
        EstadoSagaRemocao estado = sagaRemocaoService.consultarStatusSaga(sagaId);

        if (estado == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(estado);
    }
}
