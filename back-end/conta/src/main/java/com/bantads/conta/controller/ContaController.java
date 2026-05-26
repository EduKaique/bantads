package com.bantads.conta.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.conta.dto.ContaPerfilResponse;
import com.bantads.conta.dto.ContaPorCpfResponse;
import com.bantads.conta.dto.ContaResumoResponse;
import com.bantads.conta.dto.ExtratoResponse;
import com.bantads.conta.dto.ItemExtratoResponse;
import com.bantads.conta.dto.OperacaoResponse;
import com.bantads.conta.dto.SaldoResponse;
import com.bantads.conta.dto.TransferenciaRequest;
import com.bantads.conta.dto.TransferenciaResponse;
import com.bantads.conta.dto.ValorOperacaoRequest;
import com.bantads.conta.service.ServicoContaEscrita;
import com.bantads.conta.service.ServicoContaLeitura;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/contas")
public class ContaController {

    private final ServicoContaEscrita servicoContaEscrita;
    private final ServicoContaLeitura servicoContaLeitura;

    public ContaController(
        ServicoContaEscrita servicoContaEscrita,
        ServicoContaLeitura servicoContaLeitura
    ) {
        this.servicoContaEscrita = servicoContaEscrita;
        this.servicoContaLeitura = servicoContaLeitura;
    }

    @GetMapping
    public ResponseEntity<List<ContaResumoResponse>> listarContas(
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario
    ) {
        if (!ehAdministrador(tipoUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito a administradores.");
        }

        return ResponseEntity.ok(servicoContaLeitura.listarContas());
    }

    private boolean ehAdministrador(String tipoUsuario) {
        return "ADMIN".equalsIgnoreCase(tipoUsuario) || "ADMINISTRADOR".equalsIgnoreCase(tipoUsuario);
    }

    @GetMapping("/gerente/{cpfGerente}")
    public ResponseEntity<List<ContaResumoResponse>> listarContasPorGerente(
        @PathVariable String cpfGerente,
        @RequestHeader(value = "X-Usuario-Cpf", required = false) String cpfUsuario,
        @RequestHeader(value = "X-Usuario-Tipo", required = false) String tipoUsuario
    ) {
        if (!ehAdministrador(tipoUsuario) && !ehMesmoGerente(cpfGerente, cpfUsuario, tipoUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito ao gerente responsavel.");
        }

        return ResponseEntity.ok(servicoContaLeitura.listarContasPorGerente(cpfGerente));
    }

    private boolean ehMesmoGerente(String cpfGerente, String cpfUsuario, String tipoUsuario) {
        return "GERENTE".equalsIgnoreCase(tipoUsuario) && normalizarCpf(cpfGerente).equals(normalizarCpf(cpfUsuario));
    }

    private String normalizarCpf(String cpf) {
        return cpf == null ? "" : cpf.replaceAll("\\D", "");
    }

    @GetMapping("/{numero}/saldo")
    public ResponseEntity<SaldoResponse> consultarSaldo(@PathVariable String numero) {
        return ResponseEntity.ok(servicoContaLeitura.consultarSaldo(numero));
    }

    @PostMapping("/{numero}/depositar")
    public ResponseEntity<OperacaoResponse> depositar(
        @PathVariable String numero,
        @Valid @RequestBody ValorOperacaoRequest requisicao
    ) {
        return ResponseEntity.ok(servicoContaEscrita.depositar(numero, requisicao.valor()));
    }

    @PostMapping("/{numero}/sacar")
    public ResponseEntity<OperacaoResponse> sacar(
        @PathVariable String numero,
        @Valid @RequestBody ValorOperacaoRequest requisicao
    ) {
        return ResponseEntity.ok(servicoContaEscrita.sacar(numero, requisicao.valor()));
    }

    @PostMapping("/{numero}/transferir")
    public ResponseEntity<TransferenciaResponse> transferir(
        @PathVariable String numero,
        @Valid @RequestBody TransferenciaRequest requisicao
    ) {
        return ResponseEntity.ok(servicoContaEscrita.transferir(numero, requisicao.destino(), requisicao.valor()));
    }

    @GetMapping("/{numero}/extrato")
    public ResponseEntity<ExtratoResponse> consultarExtrato(@PathVariable String numero) {
        List<ItemExtratoResponse> movimentacoes = servicoContaLeitura.consultarExtrato(numero);
        SaldoResponse saldo = servicoContaLeitura.consultarSaldo(numero);
        return ResponseEntity.ok(new ExtratoResponse(numero, saldo.saldo(), movimentacoes));
    }

    @GetMapping("/{numero}")
    public ResponseEntity<ContaPerfilResponse> consultarConta(@PathVariable String numero) {
        return ResponseEntity.ok(servicoContaLeitura.consultarConta(numero));
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<ContaPorCpfResponse> consultarContaPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(servicoContaLeitura.consultarContaPorCpf(cpf));
    }
}
