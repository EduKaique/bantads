package com.bantads.conta.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.conta.dto.ContaPerfilResponse;
import com.bantads.conta.dto.ContaPorCpfResponse;
import com.bantads.conta.dto.ItemExtratoResponse;
import com.bantads.conta.dto.SaldoResponse;
import com.bantads.conta.entity.escrita.ContaEscrita;
import com.bantads.conta.entity.leitura.ContaLeitura;
import com.bantads.conta.entity.leitura.MovimentacaoLeitura;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import com.bantads.conta.repository.leitura.RepositorioContaLeitura;
import com.bantads.conta.repository.leitura.RepositorioMovimentacaoLeitura;

@Service
public class ServicoContaLeitura {

    private final RepositorioContaLeitura repositorioContaLeitura;
    private final RepositorioMovimentacaoLeitura repositorioMovimentacaoLeitura;
    private final RepositorioContaEscrita repositorioContaEscrita;

    public ServicoContaLeitura(
        RepositorioContaLeitura repositorioContaLeitura,
        RepositorioMovimentacaoLeitura repositorioMovimentacaoLeitura,
        RepositorioContaEscrita repositorioContaEscrita
    ) {
        this.repositorioContaLeitura = repositorioContaLeitura;
        this.repositorioMovimentacaoLeitura = repositorioMovimentacaoLeitura;
        this.repositorioContaEscrita = repositorioContaEscrita;
    }

    @Transactional(readOnly = true, transactionManager = "gerenciadorTransacaoLeitura")
    public SaldoResponse consultarSaldo(String numeroConta) {
        ContaLeitura conta = buscarConta(numeroConta);
        return new SaldoResponse(conta.getCliente(), conta.getNumero(), conta.getSaldo());
    }

    @Transactional(readOnly = true, transactionManager = "gerenciadorTransacaoLeitura")
    public List<ItemExtratoResponse> consultarExtrato(String numeroConta) {
        buscarConta(numeroConta);

        return repositorioMovimentacaoLeitura.findByContaOrderByDataDesc(numeroConta)
            .stream()
            .sorted(Comparator.comparing(MovimentacaoLeitura::getData).reversed())
            .map(this::mapearItemExtrato)
            .toList();
    }

    @Transactional(readOnly = true, transactionManager = "gerenciadorTransacaoLeitura")
    public ContaPerfilResponse consultarConta(String numeroConta) {
        ContaLeitura conta = buscarConta(numeroConta);
        return new ContaPerfilResponse(
            conta.getCliente(),
            conta.getNumero(),
            conta.getSaldo(),
            conta.getLimite(),
            conta.getGerente(),
            conta.getCriacao()
        );
    }

    @Transactional(readOnly = true, transactionManager = "gerenciadorTransacaoLeitura")
    public ContaPorCpfResponse consultarContaPorCpf(String cpf) {
        ContaLeitura conta = repositorioContaLeitura.findByCliente(cpf)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada para o CPF informado."));
        return new ContaPorCpfResponse(conta.getNumero(), conta.getSaldo());
    }

    @Transactional("gerenciadorTransacaoLeitura")
    public void inicializarProjecaoSeNecessario() {
        if (repositorioContaLeitura.count() > 0) {
            return;
        }

        List<ContaEscrita> contasEscrita = repositorioContaEscrita.findAll();
        List<ContaLeitura> contasLeitura = contasEscrita.stream()
            .map(this::mapearContaLeitura)
            .toList();

        repositorioContaLeitura.saveAll(contasLeitura);
    }

    private ContaLeitura buscarConta(String numeroConta) {
        return repositorioContaLeitura.findById(numeroConta)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada."));
    }

    private ItemExtratoResponse mapearItemExtrato(MovimentacaoLeitura movimentacao) {
        return new ItemExtratoResponse(
            movimentacao.getData(),
            movimentacao.getTipo(),
            movimentacao.getOrigem(),
            movimentacao.getDestino(),
            movimentacao.getValor()
        );
    }

    private ContaLeitura mapearContaLeitura(ContaEscrita contaEscrita) {
        ContaLeitura contaLeitura = new ContaLeitura();
        contaLeitura.setNumero(contaEscrita.getNumero());
        contaLeitura.setCliente(contaEscrita.getCliente());
        contaLeitura.setSaldo(contaEscrita.getSaldo());
        contaLeitura.setLimite(contaEscrita.getLimite());
        contaLeitura.setGerente(contaEscrita.getGerente());
        contaLeitura.setCriacao(contaEscrita.getCriacao());
        return contaLeitura;
    }
}
