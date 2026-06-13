package com.bantads.cliente.controller;

import com.bantads.cliente.dto.*;
import com.bantads.cliente.service.ClienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/clientes", "/"})
public class ClienteController {

    private static final String FILTRO_RELATORIO_ADMINISTRATIVO = "adm_relatorio_clientes";

    private final ClienteService clienteService;

    // Injeção do Service
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping({"", "/", "/manager/pedidos-autocadastro"})
    public ResponseEntity<?> listarClientes(
        @RequestParam(required = false) String filtro,
        @RequestParam(required = false) String cpfGerente,
        @RequestHeader(value = "X-Usuario-Cpf", required = false) String cpfGerenteSolicitante,
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario
    ) {
        if ("para_aprovar".equalsIgnoreCase(filtro)) {
            return ResponseEntity.ok(clienteService.listarParaAprovar(cpfGerenteSolicitante, tipoUsuario, cpfGerente));
        }
        if (FILTRO_RELATORIO_ADMINISTRATIVO.equalsIgnoreCase(filtro)) {
            return ResponseEntity.ok(clienteService.listarRelatorioAdministrativo(tipoUsuario));
        }
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @PostMapping({"", "/"})
    public ResponseEntity<?> autocadastro(@RequestBody AutocadastroInfoDTO clienteDto) {
        ClienteResponseDTO clienteCriado = clienteService.autocadastrar(clienteDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteCriado);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<ClienteResponseDTO> consultarCliente(
        @PathVariable String cpf,
        @RequestHeader(value = "X-Usuario-Cpf", required = false) String cpfUsuario,
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario
    ) {
        return ResponseEntity.ok(clienteService.buscarPorCpf(cpf, cpfUsuario, tipoUsuario));
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<?> alterarPerfil(@PathVariable String cpf, @RequestBody PerfilInfoDTO perfilDto) {
        clienteService.alterarPerfil(cpf, perfilDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{cpf}/aprovar")
    public ResponseEntity<RespostaAprovacaoClienteDTO> aprovarCliente(
        @PathVariable String cpf,
        @RequestHeader(value = "X-Usuario-Cpf", required = false) String cpfGerenteSolicitante,
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario
    ) {
        return ResponseEntity
            .ok()
            .body(clienteService.aprovar(cpf, cpfGerenteSolicitante, tipoUsuario));
    }

    @GetMapping("/aprovacoes/{idSaga}")
    public ResponseEntity<RespostaAprovacaoClienteDTO> consultarAprovacao(
        @PathVariable String idSaga,
        @RequestHeader(value = "X-Usuario-Cpf", required = false) String cpfGerenteSolicitante,
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario
    ) {
        return ResponseEntity.ok(clienteService.consultarAprovacao(idSaga, cpfGerenteSolicitante, tipoUsuario));
    }

    @PostMapping("/{cpf}/rejeitar")
    public ResponseEntity<?> rejeitarCliente(@PathVariable String cpf, @RequestBody MotivoRejeicaoDTO motivo) {
        clienteService.rejeitar(cpf, motivo); // Passando o motivo com sucesso!
        return ResponseEntity.ok().build();
    }
}
