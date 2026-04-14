package com.bantads.conta.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.conta.dto.OperacaoResponse;
import com.bantads.conta.dto.TransferenciaResponse;
import com.bantads.conta.entity.escrita.ContaEscrita;
import com.bantads.conta.entity.escrita.MovimentacaoEscrita;
import com.bantads.conta.mensageria.EventoMovimentacaoConta;
import com.bantads.conta.mensageria.EventoMovimentacaoContaInterno;
import com.bantads.conta.mensageria.TipoMovimentacao;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import com.bantads.conta.repository.escrita.RepositorioMovimentacaoEscrita;

@Service
public class ServicoContaEscrita {

    private final RepositorioContaEscrita repositorioContaEscrita;
    private final RepositorioMovimentacaoEscrita repositorioMovimentacaoEscrita;
    private final ApplicationEventPublisher publicadorEvento;

    public ServicoContaEscrita(
        RepositorioContaEscrita repositorioContaEscrita,
        RepositorioMovimentacaoEscrita repositorioMovimentacaoEscrita,
        ApplicationEventPublisher publicadorEvento
    ) {
        this.repositorioContaEscrita = repositorioContaEscrita;
        this.repositorioMovimentacaoEscrita = repositorioMovimentacaoEscrita;
        this.publicadorEvento = publicadorEvento;
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public OperacaoResponse depositar(String numeroConta, BigDecimal valor) {
        ContaEscrita conta = buscarConta(numeroConta);
        BigDecimal valorNormalizado = normalizarValorOperacao(valor);
        OffsetDateTime dataMovimentacao = OffsetDateTime.now();

        conta.setSaldo(normalizarValorMonetario(conta.getSaldo().add(valorNormalizado)));
        repositorioContaEscrita.save(conta);

        repositorioMovimentacaoEscrita.save(criarMovimentacao(
            conta.getNumero(),
            TipoMovimentacao.DEPOSITO,
            null,
            conta.getNumero(),
            valorNormalizado,
            conta.getSaldo(),
            dataMovimentacao
        ));

        publicarEvento(criarEvento(conta, TipoMovimentacao.DEPOSITO, null, conta.getNumero(), valorNormalizado, dataMovimentacao));

        return new OperacaoResponse(conta.getNumero(), dataMovimentacao, conta.getSaldo());
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public OperacaoResponse sacar(String numeroConta, BigDecimal valor) {
        ContaEscrita conta = buscarConta(numeroConta);
        BigDecimal valorNormalizado = normalizarValorOperacao(valor);
        validarSaldoDisponivel(conta, valorNormalizado);
        OffsetDateTime dataMovimentacao = OffsetDateTime.now();

        conta.setSaldo(normalizarValorMonetario(conta.getSaldo().subtract(valorNormalizado)));
        repositorioContaEscrita.save(conta);

        repositorioMovimentacaoEscrita.save(criarMovimentacao(
            conta.getNumero(),
            TipoMovimentacao.SAQUE,
            conta.getNumero(),
            null,
            valorNormalizado,
            conta.getSaldo(),
            dataMovimentacao
        ));

        publicarEvento(criarEvento(conta, TipoMovimentacao.SAQUE, conta.getNumero(), null, valorNormalizado, dataMovimentacao));

        return new OperacaoResponse(conta.getNumero(), dataMovimentacao, conta.getSaldo());
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public TransferenciaResponse transferir(String contaOrigemNumero, String contaDestinoNumero, BigDecimal valor) {
        if (contaOrigemNumero.equals(contaDestinoNumero)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A conta de destino deve ser diferente da conta de origem.");
        }

        ContaEscrita contaOrigem = buscarConta(contaOrigemNumero);
        ContaEscrita contaDestino = buscarConta(contaDestinoNumero);
        BigDecimal valorNormalizado = normalizarValorOperacao(valor);
        validarSaldoDisponivel(contaOrigem, valorNormalizado);
        OffsetDateTime dataMovimentacao = OffsetDateTime.now();

        contaOrigem.setSaldo(normalizarValorMonetario(contaOrigem.getSaldo().subtract(valorNormalizado)));
        contaDestino.setSaldo(normalizarValorMonetario(contaDestino.getSaldo().add(valorNormalizado)));

        repositorioContaEscrita.save(contaOrigem);
        repositorioContaEscrita.save(contaDestino);

        repositorioMovimentacaoEscrita.save(criarMovimentacao(
            contaOrigem.getNumero(),
            TipoMovimentacao.TRANSFERENCIA,
            contaOrigem.getNumero(),
            contaDestino.getNumero(),
            valorNormalizado,
            contaOrigem.getSaldo(),
            dataMovimentacao
        ));

        repositorioMovimentacaoEscrita.save(criarMovimentacao(
            contaDestino.getNumero(),
            TipoMovimentacao.TRANSFERENCIA,
            contaOrigem.getNumero(),
            contaDestino.getNumero(),
            valorNormalizado,
            contaDestino.getSaldo(),
            dataMovimentacao
        ));

        publicarEvento(criarEvento(contaOrigem, TipoMovimentacao.TRANSFERENCIA, contaOrigem.getNumero(), contaDestino.getNumero(), valorNormalizado, dataMovimentacao));
        publicarEvento(criarEvento(contaDestino, TipoMovimentacao.TRANSFERENCIA, contaOrigem.getNumero(), contaDestino.getNumero(), valorNormalizado, dataMovimentacao));

        return new TransferenciaResponse(
            contaOrigem.getNumero(),
            dataMovimentacao,
            contaDestino.getNumero(),
            contaOrigem.getSaldo(),
            valorNormalizado
        );
    }

    private ContaEscrita buscarConta(String numeroConta) {
        return repositorioContaEscrita.findById(numeroConta)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada."));
    }

    private void validarSaldoDisponivel(ContaEscrita conta, BigDecimal valor) {
        BigDecimal saldoDisponivel = conta.getSaldo().add(conta.getLimite());
        if (saldoDisponivel.compareTo(valor) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saldo insuficiente.");
        }
    }

    private BigDecimal normalizarValorOperacao(BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O valor deve ser maior que zero.");
        }

        return normalizarValorMonetario(valor);
    }

    private BigDecimal normalizarValorMonetario(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    private MovimentacaoEscrita criarMovimentacao(
        String conta,
        TipoMovimentacao tipo,
        String origem,
        String destino,
        BigDecimal valor,
        BigDecimal saldoResultante,
        OffsetDateTime dataMovimentacao
    ) {
        MovimentacaoEscrita movimentacao = new MovimentacaoEscrita();
        movimentacao.setConta(conta);
        movimentacao.setTipo(tipo.getDescricao());
        movimentacao.setOrigem(origem);
        movimentacao.setDestino(destino);
        movimentacao.setValor(valor);
        movimentacao.setSaldoResultante(saldoResultante);
        movimentacao.setData(dataMovimentacao);
        return movimentacao;
    }

    private EventoMovimentacaoConta criarEvento(
        ContaEscrita conta,
        TipoMovimentacao tipo,
        String origem,
        String destino,
        BigDecimal valor,
        OffsetDateTime dataMovimentacao
    ) {
        return new EventoMovimentacaoConta(
            conta.getNumero(),
            conta.getCliente(),
            conta.getGerente(),
            conta.getLimite(),
            conta.getSaldo(),
            conta.getCriacao(),
            dataMovimentacao,
            tipo,
            origem,
            destino,
            valor
        );
    }

    private void publicarEvento(EventoMovimentacaoConta evento) {
        publicadorEvento.publishEvent(new EventoMovimentacaoContaInterno(evento));
    }
}
