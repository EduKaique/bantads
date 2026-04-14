package com.bantads.conta.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.conta.dto.OperacaoResponse;
import com.bantads.conta.dto.TransferenciaResponse;
import com.bantads.conta.entity.escrita.ContaEscrita;
import com.bantads.conta.entity.escrita.MovimentacaoEscrita;
import com.bantads.conta.mensageria.EventoMovimentacaoContaInterno;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import com.bantads.conta.repository.escrita.RepositorioMovimentacaoEscrita;

@ExtendWith(MockitoExtension.class)
class ServicoContaEscritaTest {

    @Mock
    private RepositorioContaEscrita repositorioContaEscrita;

    @Mock
    private RepositorioMovimentacaoEscrita repositorioMovimentacaoEscrita;

    @Mock
    private ApplicationEventPublisher publicadorEvento;

    @InjectMocks
    private ServicoContaEscrita servicoContaEscrita;

    @Captor
    private ArgumentCaptor<MovimentacaoEscrita> movimentacaoCaptor;

    @Captor
    private ArgumentCaptor<EventoMovimentacaoContaInterno> eventoCaptor;

    private ContaEscrita contaOrigem;
    private ContaEscrita contaDestino;

    @BeforeEach
    void configurarContas() {
        contaOrigem = criarConta("4321", "44636173910", new BigDecimal("1000.00"), new BigDecimal("500.00"));
        contaDestino = criarConta("8765", "11944108980", new BigDecimal("300.00"), new BigDecimal("700.00"));
    }

    @Test
    void deveDepositarEPublicarEvento() {
        when(repositorioContaEscrita.findById("4321")).thenReturn(Optional.of(contaOrigem));

        OperacaoResponse resposta = servicoContaEscrita.depositar("4321", new BigDecimal("250.00"));

        assertEquals("4321", resposta.conta());
        assertEquals(new BigDecimal("1250.00"), resposta.saldo());

        verify(repositorioContaEscrita).save(contaOrigem);
        verify(repositorioMovimentacaoEscrita).save(movimentacaoCaptor.capture());
        verify(publicadorEvento).publishEvent(eventoCaptor.capture());

        MovimentacaoEscrita movimentacao = movimentacaoCaptor.getValue();
        assertEquals("4321", movimentacao.getConta());
        assertEquals("depósito", movimentacao.getTipo());
        assertEquals(new BigDecimal("250.00"), movimentacao.getValor());
        assertEquals(new BigDecimal("1250.00"), movimentacao.getSaldoResultante());

        EventoMovimentacaoContaInterno eventoInterno = eventoCaptor.getValue();
        assertEquals("4321", eventoInterno.evento().conta());
        assertEquals(new BigDecimal("1250.00"), eventoInterno.evento().saldo());
        assertEquals("4321", eventoInterno.evento().destino());
    }

    @Test
    void devePermitirDepositoEmContaComSaldoNegativo() {
        contaOrigem.setSaldo(new BigDecimal("-67052.50"));
        when(repositorioContaEscrita.findById("4321")).thenReturn(Optional.of(contaOrigem));

        OperacaoResponse resposta = servicoContaEscrita.depositar("4321", new BigDecimal("100.00"));

        assertEquals(new BigDecimal("-66952.50"), resposta.saldo());
        verify(repositorioContaEscrita).save(contaOrigem);
        verify(publicadorEvento).publishEvent(any(EventoMovimentacaoContaInterno.class));
    }

    @Test
    void deveImpedirSaqueQuandoSaldoMaisLimiteForInsuficiente() {
        when(repositorioContaEscrita.findById("4321")).thenReturn(Optional.of(contaOrigem));

        ResponseStatusException excecao = assertThrows(
            ResponseStatusException.class,
            () -> servicoContaEscrita.sacar("4321", new BigDecimal("2000.00"))
        );

        assertEquals("400 BAD_REQUEST \"Saldo insuficiente.\"", excecao.getMessage());
        verify(repositorioContaEscrita, never()).save(any());
        verify(repositorioMovimentacaoEscrita, never()).save(any());
        verify(publicadorEvento, never()).publishEvent(any());
    }

    @Test
    void deveTransferirEntreContasValidas() {
        when(repositorioContaEscrita.findById("4321")).thenReturn(Optional.of(contaOrigem));
        when(repositorioContaEscrita.findById("8765")).thenReturn(Optional.of(contaDestino));

        TransferenciaResponse resposta = servicoContaEscrita.transferir("4321", "8765", new BigDecimal("150.00"));

        assertEquals("4321", resposta.conta());
        assertEquals("8765", resposta.destino());
        assertEquals(new BigDecimal("850.00"), resposta.saldo());
        assertEquals(new BigDecimal("150.00"), resposta.valor());
        assertEquals(new BigDecimal("850.00"), contaOrigem.getSaldo());
        assertEquals(new BigDecimal("450.00"), contaDestino.getSaldo());

        verify(repositorioMovimentacaoEscrita, times(2)).save(movimentacaoCaptor.capture());
        verify(publicadorEvento, times(2)).publishEvent(any(EventoMovimentacaoContaInterno.class));

        List<MovimentacaoEscrita> movimentacoes = movimentacaoCaptor.getAllValues();
        assertEquals(2, movimentacoes.size());
        assertEquals("4321", movimentacoes.getFirst().getConta());
        assertEquals("8765", movimentacoes.getLast().getConta());
    }

    private ContaEscrita criarConta(String numero, String cliente, BigDecimal saldo, BigDecimal limite) {
        ContaEscrita conta = new ContaEscrita();
        conta.setNumero(numero);
        conta.setCliente(cliente);
        conta.setSaldo(saldo);
        conta.setLimite(limite);
        conta.setGerente("33427040046");
        conta.setCriacao(OffsetDateTime.parse("2024-01-15T10:00:00Z"));
        return conta;
    }
}
