package com.bantads.cliente.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bantads.cliente.dto.AutocadastroInfoDTO;
import com.bantads.cliente.dto.ClienteResponseDTO;
import com.bantads.cliente.dto.MotivoRejeicaoDTO;
import com.bantads.cliente.dto.PerfilInfoDTO;
import com.bantads.cliente.dto.RespostaAprovacaoClienteDTO;
import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.repository.ClienteRepository;
import com.bantads.cliente.service.ClienteService;

@RestController
@RequestMapping({"/clientes", "/"})
public class ClienteController {

    private static final String FILTRO_RELATORIO_ADMINISTRATIVO = "adm_relatorio_clientes";

    private final ClienteService clienteService;

    private final ClienteRepository clienteRepository;

    // Injeção do Service
    public ClienteController(ClienteService clienteService, ClienteRepository clienteRepository) {
        this.clienteService = clienteService;
        this.clienteRepository = clienteRepository;
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
        
        if ("melhores_clientes".equalsIgnoreCase(filtro)) {
            return ResponseEntity.ok(clienteService.listarMelhoresClientes(tipoUsuario));
        }

        return ResponseEntity.ok(clienteService.listarTodos(cpfGerenteSolicitante, tipoUsuario));
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
    public ResponseEntity<ClienteResponseDTO> alterarPerfil(@PathVariable String cpf, @RequestBody PerfilInfoDTO perfilDto) {
        return ResponseEntity.ok(clienteService.alterarPerfil(cpf, perfilDto));
    }

    @PostMapping("/{cpf}/aprovar")
    public ResponseEntity<RespostaAprovacaoClienteDTO> aprovarCliente(
        @PathVariable String cpf,
        @RequestHeader(value = "X-Usuario-Cpf", required = false) String cpfGerenteSolicitante,
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario
    ) { 
        // Inicia saga assincronamente
        RespostaAprovacaoClienteDTO clienteAprovado = clienteService.aprovar(cpf, cpfGerenteSolicitante, tipoUsuario);

        for (int i = 0; i < 10; i++) {
            Cliente cliente = clienteRepository.findById(cpf).orElse(null);
            
            if (cliente != null && cliente.getConta() != null && !cliente.getConta().isBlank()) {
                break; 
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        return ResponseEntity
            .ok()
            .body(clienteAprovado);
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
    public ResponseEntity<?> rejeitarCliente(@PathVariable String cpf, @RequestBody MotivoRejeicaoDTO motivo, @RequestHeader(value = "X-Usuario-Cpf", required = false) String cpfGerenteSolicitante,
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario) {
        clienteService.rejeitar(cpf, motivo, cpfGerenteSolicitante, tipoUsuario); // Passando o motivo com sucesso!
        return ResponseEntity.ok().build();
    }
}
