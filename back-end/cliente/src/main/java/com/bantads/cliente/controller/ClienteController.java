package com.bantads.cliente.controller;

import com.bantads.cliente.dto.*;
import com.bantads.cliente.service.ClienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    // Injeção do Service
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping({"", "/", "/manager/pedidos-autocadastro"})
    public ResponseEntity<?> listarClientes(@RequestParam(required = false) String filtro) {
        if ("para_aprovar".equalsIgnoreCase(filtro)) {
            return ResponseEntity.ok(clienteService.listarParaAprovar());
        }
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<?> autocadastro(@RequestBody AutocadastroInfoDTO clienteDto) {
        clienteService.autocadastrar(clienteDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<ClienteResponseDTO> consultarCliente(@PathVariable String cpf) {
        return ResponseEntity.ok(clienteService.buscarPorCpf(cpf));
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<?> alterarPerfil(@PathVariable String cpf, @RequestBody PerfilInfoDTO perfilDto) {
        clienteService.alterarPerfil(cpf, perfilDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{cpf}/aprovar")
    public ResponseEntity<?> aprovarCliente(@PathVariable String cpf) {
        clienteService.aprovar(cpf);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{cpf}/rejeitar")
    public ResponseEntity<?> rejeitarCliente(@PathVariable String cpf, @RequestBody MotivoRejeicaoDTO motivo) {
        clienteService.rejeitar(cpf, motivo); // Passando o motivo com sucesso!
        return ResponseEntity.ok().build();
    }
}