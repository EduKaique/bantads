package com.bantads.cliente.mensageria.aprovacao;

import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.model.SagaAprovacaoCliente;
import com.bantads.cliente.model.StatusCliente;
import com.bantads.cliente.model.StatusSagaAprovacaoCliente;
import com.bantads.cliente.repository.ClienteRepository;
import com.bantads.cliente.repository.RepositorioSagaAprovacaoCliente;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrquestradorAprovacaoClienteTest {

    @Mock
    private RepositorioSagaAprovacaoCliente repositorioSaga;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private PublicadorAprovacaoCliente publicador;

    @InjectMocks
    private OrquestradorAprovacaoCliente orquestrador;

    @Captor
    private ArgumentCaptor<ComandoCompensacaoContaAprovacao> compensacaoContaCaptor;

    @Captor
    private ArgumentCaptor<ComandoCompensacaoAcessoAprovacao> compensacaoAcessoCaptor;

    @Captor
    private ArgumentCaptor<ComandoCriacaoContaAprovacao> criacaoContaCaptor;

    @Test
    void devePublicarCriacaoContaApenasAposCommit() {
        SagaAprovacaoCliente saga = new SagaAprovacaoCliente();
        saga.setIdSaga("saga-2");

        Cliente cliente = new Cliente();
        cliente.setCpf("12345678901");
        cliente.setCpfGerenteResponsavel("33427040046");
        cliente.setSalario(3000.00);
        cliente.setEmail("cliente@bantads.com");

        when(repositorioSaga.save(saga)).thenReturn(saga);

        TransactionSynchronizationManager.initSynchronization();
        try {
            orquestrador.iniciar(saga, cliente);

            verify(publicador, never()).solicitarCriacaoConta(any());
            TransactionSynchronizationManager.getSynchronizations()
                .forEach(sincronizacao -> sincronizacao.afterCommit());

            verify(publicador).solicitarCriacaoConta(criacaoContaCaptor.capture());
            assertEquals("saga-2", criacaoContaCaptor.getValue().idSaga());
            assertEquals("12345678901", criacaoContaCaptor.getValue().cpfCliente());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void deveCompensarContaEAcessoQuandoTimeoutAguardandoAuth() {
        SagaAprovacaoCliente saga = new SagaAprovacaoCliente();
        saga.setIdSaga("saga-1");
        saga.setCpfCliente("12345678901");
        saga.setCpfGerenteSolicitante("33427040046");
        saga.setCpfGerenteResponsavel("33427040046");
        saga.setStatus(StatusSagaAprovacaoCliente.AGUARDANDO_AUTH);
        saga.setNumeroConta("1234");
        saga.setEmailCliente("cliente@bantads.com");
        saga.setCriadaEm(OffsetDateTime.now().minusSeconds(90));
        saga.setAtualizadaEm(OffsetDateTime.now().minusSeconds(90));

        Cliente cliente = new Cliente();
        cliente.setCpf("12345678901");
        cliente.setStatus(StatusCliente.EM_APROVACAO);

        when(repositorioSaga.findByStatusInAndAtualizadaEmBefore(anyCollection(), any())).thenReturn(List.of(saga));
        when(clienteRepository.findById("12345678901")).thenReturn(Optional.of(cliente));

        orquestrador.expirarAprovacoesAtrasadas();

        assertEquals(StatusSagaAprovacaoCliente.FALHOU, saga.getStatus());
        assertEquals(StatusCliente.FALHA_APROVACAO, cliente.getStatus());
        verify(publicador).solicitarCompensacaoConta(compensacaoContaCaptor.capture());
        verify(publicador).solicitarCompensacaoAcesso(compensacaoAcessoCaptor.capture());
        assertEquals("1234", compensacaoContaCaptor.getValue().numeroConta());
        assertEquals("cliente@bantads.com", compensacaoAcessoCaptor.getValue().emailCliente());
    }

    @Test
    void deveCompensarContaCriadaAposSagaFalharPorTimeout() {
        SagaAprovacaoCliente saga = new SagaAprovacaoCliente();
        saga.setIdSaga("saga-tardia-conta");
        saga.setCpfCliente("12345678901");
        saga.setStatus(StatusSagaAprovacaoCliente.FALHOU);

        when(repositorioSaga.findById("saga-tardia-conta")).thenReturn(Optional.of(saga));

        ResultadoContaAprovacao resultado = new ResultadoContaAprovacao(
            "saga-tardia-conta",
            "12345678901",
            true,
            "9876",
            new BigDecimal("1500.00"),
            true,
            "Conta criada com atraso"
        );

        orquestrador.processarResultadoConta(resultado);

        verify(publicador).solicitarCompensacaoConta(compensacaoContaCaptor.capture());
        assertEquals("saga-tardia-conta", compensacaoContaCaptor.getValue().idSaga());
        assertEquals("12345678901", compensacaoContaCaptor.getValue().cpfCliente());
        assertEquals("9876", compensacaoContaCaptor.getValue().numeroConta());
    }

    @Test
    void naoDeveCompensarContaExistenteRecebidaAposSagaFalharPorTimeout() {
        SagaAprovacaoCliente saga = new SagaAprovacaoCliente();
        saga.setIdSaga("saga-tardia-conta-existente");
        saga.setCpfCliente("12345678901");
        saga.setStatus(StatusSagaAprovacaoCliente.FALHOU);

        when(repositorioSaga.findById("saga-tardia-conta-existente")).thenReturn(Optional.of(saga));

        ResultadoContaAprovacao resultado = new ResultadoContaAprovacao(
            "saga-tardia-conta-existente",
            "12345678901",
            true,
            "9876",
            new BigDecimal("1500.00"),
            false,
            "Conta ja existente para o cliente"
        );

        orquestrador.processarResultadoConta(resultado);

        verify(publicador, never()).solicitarCompensacaoConta(any());
    }

    @Test
    void deveCompensarAcessoCriadoAposSagaFalharPorTimeout() {
        SagaAprovacaoCliente saga = new SagaAprovacaoCliente();
        saga.setIdSaga("saga-tardia-acesso");
        saga.setCpfCliente("12345678901");
        saga.setStatus(StatusSagaAprovacaoCliente.FALHOU);

        when(repositorioSaga.findById("saga-tardia-acesso")).thenReturn(Optional.of(saga));

        ResultadoAcessoAprovacao resultado = new ResultadoAcessoAprovacao(
            "saga-tardia-acesso",
            "12345678901",
            "cliente@bantads.com",
            true,
            true,
            "Acesso criado com atraso"
        );

        orquestrador.processarResultadoAcesso(resultado);

        verify(publicador).solicitarCompensacaoAcesso(compensacaoAcessoCaptor.capture());
        assertEquals("saga-tardia-acesso", compensacaoAcessoCaptor.getValue().idSaga());
        assertEquals("12345678901", compensacaoAcessoCaptor.getValue().cpfCliente());
        assertEquals("cliente@bantads.com", compensacaoAcessoCaptor.getValue().emailCliente());
    }
}
