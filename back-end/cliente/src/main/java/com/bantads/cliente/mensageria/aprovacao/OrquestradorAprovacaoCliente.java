package com.bantads.cliente.mensageria.aprovacao;

import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.model.SagaAprovacaoCliente;
import com.bantads.cliente.model.StatusCliente;
import com.bantads.cliente.model.StatusSagaAprovacaoCliente;
import com.bantads.cliente.repository.ClienteRepository;
import com.bantads.cliente.repository.RepositorioSagaAprovacaoCliente;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Component
public class OrquestradorAprovacaoCliente {

    private static final int SEGUNDOS_TIMEOUT = 60;

    private final RepositorioSagaAprovacaoCliente repositorioSaga;
    private final ClienteRepository clienteRepository;
    private final PublicadorAprovacaoCliente publicador;

    public OrquestradorAprovacaoCliente(
        RepositorioSagaAprovacaoCliente repositorioSaga,
        ClienteRepository clienteRepository,
        PublicadorAprovacaoCliente publicador
    ) {
        this.repositorioSaga = repositorioSaga;
        this.clienteRepository = clienteRepository;
        this.publicador = publicador;
    }

    @Transactional
    public SagaAprovacaoCliente iniciar(SagaAprovacaoCliente saga, Cliente cliente) {
        // publica commando para criar conta
        saga.setStatus(StatusSagaAprovacaoCliente.AGUARDANDO_CONTA);
        saga.setEtapaAtual("CRIACAO_CONTA");
        SagaAprovacaoCliente sagaSalva = repositorioSaga.save(saga);

        ComandoCriacaoContaAprovacao comando = new ComandoCriacaoContaAprovacao(
            sagaSalva.getIdSaga(),
            cliente.getCpf(),
            cliente.getCpfGerenteResponsavel(),
            BigDecimal.valueOf(cliente.getSalario()),
            BigDecimal.ZERO,
            cliente.getEmail()
        );
        executarAposCommit(() -> publicador.solicitarCriacaoConta(comando));

        return sagaSalva;
    }

    @Transactional
    public void processarResultadoConta(ResultadoContaAprovacao resultado) {
        // Recebe resultado do conta e dispara auth
        SagaAprovacaoCliente saga = repositorioSaga.findById(resultado.idSaga()).orElse(null);
        if (saga == null || saga.getStatus() == StatusSagaAprovacaoCliente.CONCLUIDA) {
            return;
        }
        if (saga.getStatus() == StatusSagaAprovacaoCliente.FALHOU) {
            compensarContaTardiaSeNecessario(saga, resultado);
            return;
        }
        if (saga.getStatus() != StatusSagaAprovacaoCliente.AGUARDANDO_CONTA) {
            return;
        }

        if (!resultado.sucesso()) {
            registrarFalha(saga, mensagemFalha(resultado.mensagem(), "Falha ao criar conta."), false, false);
            return;
        }

        saga.setNumeroConta(resultado.numeroConta());
        saga.setContaCriadaPelaSaga(resultado.contaCriada());
        saga.setStatus(StatusSagaAprovacaoCliente.AGUARDANDO_AUTH);
        saga.setEtapaAtual("CRIACAO_ACESSO");
        saga.setMensagemErro(null);
        repositorioSaga.save(saga);

        Cliente cliente = clienteRepository.findById(saga.getCpfCliente()).orElse(null);
        if (cliente == null) {
            registrarFalha(saga, "Cliente nao encontrado para criacao do acesso inicial.", true, false);
            return;
        }

        ComandoCriacaoAcessoAprovacao comando = new ComandoCriacaoAcessoAprovacao(
            saga.getIdSaga(),
            cliente.getCpf(),
            cliente.getNome(),
            cliente.getEmail()
        );
        executarAposCommit(() -> publicador.solicitarCriacaoAcesso(comando));
    }

    @Transactional
    public void processarResultadoAcesso(ResultadoAcessoAprovacao resultado) {
        // Recebe resultado do auth
        SagaAprovacaoCliente saga = repositorioSaga.findById(resultado.idSaga()).orElse(null);
        if (saga == null || saga.getStatus() == StatusSagaAprovacaoCliente.CONCLUIDA) {
            return;
        }
        if (saga.getStatus() == StatusSagaAprovacaoCliente.FALHOU) {
            compensarAcessoTardioSeNecessario(saga, resultado);
            return;
        }
        if (saga.getStatus() != StatusSagaAprovacaoCliente.AGUARDANDO_AUTH) {
            return;
        }

        if (!resultado.sucesso()) {
            registrarFalha(saga, mensagemFalha(resultado.mensagem(), "Falha ao criar acesso inicial."), true, false);
            return;
        }

        saga.setAcessoCriadoPelaSaga(resultado.acessoCriado());

        Cliente cliente = clienteRepository.findById(saga.getCpfCliente()).orElse(null);
        if (cliente == null) {
            registrarFalha(saga, "Cliente nao encontrado para conclusao da aprovacao.", true, true);
            return;
        }
        
        cliente.setConta(saga.getNumeroConta());

        // Fluxo termina com sucesso
        cliente.setStatus(StatusCliente.APROVADO);
        clienteRepository.save(cliente);

        saga.setStatus(StatusSagaAprovacaoCliente.CONCLUIDA);
        saga.setEtapaAtual("CONCLUIDA");
        saga.setMensagemErro(null);
        saga.setFinalizadaEm(OffsetDateTime.now());
        repositorioSaga.save(saga);
    }

    @Scheduled(fixedDelay = 15000)
    @Transactional
    public void expirarAprovacoesAtrasadas() {
        OffsetDateTime limite = OffsetDateTime.now().minusSeconds(SEGUNDOS_TIMEOUT);
        List<SagaAprovacaoCliente> atrasadas = repositorioSaga.findByStatusInAndAtualizadaEmBefore(
            List.of(StatusSagaAprovacaoCliente.AGUARDANDO_CONTA, StatusSagaAprovacaoCliente.AGUARDANDO_AUTH),
            limite
        );

        for (SagaAprovacaoCliente saga : atrasadas) {
            boolean contaCriada = saga.getNumeroConta() != null && !saga.getNumeroConta().isBlank();
            boolean acessoSolicitado = saga.getStatus() == StatusSagaAprovacaoCliente.AGUARDANDO_AUTH;
            registrarFalha(saga, "Tempo limite da aprovacao excedido.", contaCriada, acessoSolicitado);
        }
    }

    private void registrarFalha(
        SagaAprovacaoCliente saga,
        String mensagem,
        boolean compensarConta,
        boolean compensarAcesso
    ) {
        // Compensação automática: desfaz conta e/ou acesso se algo falhou
        Cliente cliente = clienteRepository.findById(saga.getCpfCliente()).orElse(null);
        if (cliente != null && cliente.getStatus() != StatusCliente.APROVADO) {
            cliente.setStatus(StatusCliente.FALHA_APROVACAO);
            clienteRepository.save(cliente);
        }

        saga.setStatus(StatusSagaAprovacaoCliente.FALHOU);
        saga.setEtapaAtual("FALHA");
        saga.setMensagemErro(mensagem);
        saga.setFinalizadaEm(OffsetDateTime.now());
        repositorioSaga.save(saga);

        if (compensarConta && saga.getNumeroConta() != null && !saga.getNumeroConta().isBlank()) {
            ComandoCompensacaoContaAprovacao comando = new ComandoCompensacaoContaAprovacao(
                saga.getIdSaga(),
                saga.getCpfCliente(),
                saga.getNumeroConta(),
                mensagem
            );
            executarAposCommit(() -> publicador.solicitarCompensacaoConta(comando));
        }

        if (compensarAcesso && saga.getEmailCliente() != null && !saga.getEmailCliente().isBlank()) {
            ComandoCompensacaoAcessoAprovacao comando = new ComandoCompensacaoAcessoAprovacao(
                saga.getIdSaga(),
                saga.getCpfCliente(),
                saga.getEmailCliente(),
                mensagem
            );
            executarAposCommit(() -> publicador.solicitarCompensacaoAcesso(comando));
        }
    }

    private void compensarContaTardiaSeNecessario(SagaAprovacaoCliente saga, ResultadoContaAprovacao resultado) {
        if (!resultado.sucesso() || !resultado.contaCriada() || resultado.numeroConta() == null || resultado.numeroConta().isBlank()) {
            return;
        }
        ComandoCompensacaoContaAprovacao comando = new ComandoCompensacaoContaAprovacao(
            saga.getIdSaga(),
            saga.getCpfCliente(),
            resultado.numeroConta(),
            "Resultado de criacao de conta recebido apos falha da aprovacao."
        );
        executarAposCommit(() -> publicador.solicitarCompensacaoConta(comando));
    }

    private void compensarAcessoTardioSeNecessario(SagaAprovacaoCliente saga, ResultadoAcessoAprovacao resultado) {
        if (!resultado.sucesso() || !resultado.acessoCriado() || resultado.emailCliente() == null || resultado.emailCliente().isBlank()) {
            return;
        }
        ComandoCompensacaoAcessoAprovacao comando = new ComandoCompensacaoAcessoAprovacao(
            saga.getIdSaga(),
            saga.getCpfCliente(),
            resultado.emailCliente(),
            "Resultado de criacao de acesso recebido apos falha da aprovacao."
        );
        executarAposCommit(() -> publicador.solicitarCompensacaoAcesso(comando));
    }

    private String mensagemFalha(String mensagem, String padrao) {
        if (mensagem == null || mensagem.isBlank()) {
            return padrao;
        }
        return mensagem;
    }

    private void executarAposCommit(Runnable acao) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            acao.run();
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                acao.run();
            }
        });
    }
}
