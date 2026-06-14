package com.bantads.conta.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.time.temporal.ChronoUnit;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.conta.dto.OperacaoResponse;
import com.bantads.conta.dto.TransferenciaResponse;
import com.bantads.conta.entity.escrita.ContaEscrita;
import com.bantads.conta.entity.escrita.MovimentacaoEscrita;
import com.bantads.conta.mensageria.EventoMovimentacaoConta;
import com.bantads.conta.mensageria.EventoMovimentacaoContaInterno;
import com.bantads.conta.mensageria.TipoMovimentacao;
import com.bantads.conta.mensageria.aprovacao.ComandoCriacaoContaAprovacao;
import com.bantads.conta.mensageria.aprovacao.ResultadoContaAprovacao;
import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import com.bantads.conta.repository.escrita.RepositorioMovimentacaoEscrita;

@Service
public class ServicoContaEscrita {

    private final RepositorioContaEscrita repositorioContaEscrita;
    private final RepositorioMovimentacaoEscrita repositorioMovimentacaoEscrita;
    private final ApplicationEventPublisher publicadorEvento;
    private final ServicoContaLeitura servicoContaLeitura;
    private final SecureRandom sorteador = new SecureRandom();

    public ServicoContaEscrita(
        RepositorioContaEscrita repositorioContaEscrita,
        RepositorioMovimentacaoEscrita repositorioMovimentacaoEscrita,
        ApplicationEventPublisher publicadorEvento,
        ServicoContaLeitura servicoContaLeitura
    ) {
        this.repositorioContaEscrita = repositorioContaEscrita;
        this.repositorioMovimentacaoEscrita = repositorioMovimentacaoEscrita;
        this.publicadorEvento = publicadorEvento;
        this.servicoContaLeitura = servicoContaLeitura;
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public ResultadoContaAprovacao criarContaAprovacao(ComandoCriacaoContaAprovacao comando) {
        try {
            validarComandoCriacaoConta(comando);

            Optional<ContaEscrita> contaExistente = repositorioContaEscrita.findByCliente(comando.cpfCliente());
            if (contaExistente.isPresent()) {
                ContaEscrita conta = contaExistente.get();
                servicoContaLeitura.salvarProjecaoConta(conta);
                return new ResultadoContaAprovacao(
                    comando.idSaga(),
                    comando.cpfCliente(),
                    true,
                    conta.getNumero(),
                    conta.getLimite(),
                    false,
                    "Conta ja existente para o cliente"
                );
            }

            ContaEscrita conta = new ContaEscrita();
            conta.setNumero(gerarNumeroConta());
            conta.setCliente(comando.cpfCliente());
            conta.setGerente(comando.cpfGerenteResponsavel());
            conta.setSaldo(normalizarValorMonetario(valorOuZero(comando.saldoInicial())));
            conta.setLimite(calcularLimite(comando.salario()));
            conta.setCriacao(OffsetDateTime.now().truncatedTo(ChronoUnit.MILLIS));
            conta.setIdSagaAprovacao(comando.idSaga());

            repositorioContaEscrita.save(conta);
            servicoContaLeitura.salvarProjecaoConta(conta);

            return new ResultadoContaAprovacao(
                comando.idSaga(),
                comando.cpfCliente(),
                true,
                conta.getNumero(),
                conta.getLimite(),
                true,
                "Conta criada com sucesso"
            );
        } catch (Exception e) {
            String idSaga = comando != null ? comando.idSaga() : null;
            String cpfCliente = comando != null ? comando.cpfCliente() : null;
            marcarTransacaoAtualParaRollback();
            return new ResultadoContaAprovacao(
                idSaga,
                cpfCliente,
                false,
                null,
                null,
                false,
                e.getMessage()
            );
        }
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public ResultadoContaAprovacao compensarContaAprovacao(String idSaga, String cpfCliente, String numeroConta) {
        Optional<ContaEscrita> contaExistente = repositorioContaEscrita.findById(numeroConta);
        if (contaExistente.isPresent() && deveCompensarConta(contaExistente.get(), idSaga, cpfCliente)) {
            repositorioContaEscrita.delete(contaExistente.get());
            servicoContaLeitura.removerProjecaoConta(numeroConta);
        }

        return new ResultadoContaAprovacao(
            idSaga,
            cpfCliente,
            true,
            numeroConta,
            null,
            false,
            "Conta compensada com sucesso"
        );
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public OperacaoResponse depositar(String numeroConta, BigDecimal valor) {
        ContaEscrita conta = buscarConta(numeroConta);
        BigDecimal valorNormalizado = normalizarValorOperacao(valor);
        OffsetDateTime dataMovimentacao = OffsetDateTime.now().truncatedTo(ChronoUnit.MILLIS);

        conta.setSaldo(normalizarValorMonetario(conta.getSaldo().add(valorNormalizado)));
        repositorioContaEscrita.save(conta);

        repositorioMovimentacaoEscrita.save(criarMovimentacao(
            conta.getNumero(),
            TipoMovimentacao.DEPOSITO,
            conta.getNumero(),
            conta.getNumero(),
            valorNormalizado,
            conta.getSaldo(),
            dataMovimentacao
        ));

        publicarEvento(criarEvento(conta, TipoMovimentacao.DEPOSITO, conta.getNumero(), conta.getNumero(), valorNormalizado, dataMovimentacao));

        return new OperacaoResponse(conta.getNumero(), dataMovimentacao, conta.getSaldo());
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public OperacaoResponse sacar(String numeroConta, BigDecimal valor) {
        ContaEscrita conta = buscarConta(numeroConta);
        BigDecimal valorNormalizado = normalizarValorOperacao(valor);
        validarSaldoDisponivel(conta, valorNormalizado);
        OffsetDateTime dataMovimentacao = OffsetDateTime.now().truncatedTo(ChronoUnit.MILLIS);

        conta.setSaldo(normalizarValorMonetario(conta.getSaldo().subtract(valorNormalizado)));
        repositorioContaEscrita.save(conta);

        repositorioMovimentacaoEscrita.save(criarMovimentacao(
            conta.getNumero(),
            TipoMovimentacao.SAQUE,
            conta.getNumero(),
            conta.getNumero(),
            valorNormalizado,
            conta.getSaldo(),
            dataMovimentacao
        ));

        publicarEvento(criarEvento(conta, TipoMovimentacao.DEPOSITO, conta.getNumero(), conta.getNumero(), valorNormalizado, dataMovimentacao));

        return new OperacaoResponse(conta.getNumero(), dataMovimentacao, conta.getSaldo());
    }

    @Transactional("gerenciadorTransacaoEscrita")
    public void atualizarLimiteSaga(String cpf, Double novoSalario) {
        Optional<ContaEscrita> contaOpt = repositorioContaEscrita.findByCliente(cpf);        
       
        if (contaOpt.isEmpty()) {
            System.out.println("SAGA [Aviso]: CPF " + cpf + " não possui conta. Ignorando evento.");
            return;
        }

        ContaEscrita conta = contaOpt.get();
        BigDecimal salario = BigDecimal.valueOf(novoSalario);
        BigDecimal novoLimite = BigDecimal.ZERO;

        if (salario.compareTo(new BigDecimal("2000.00")) >= 0) {
            novoLimite = salario.multiply(new BigDecimal("0.5"));
        }

        BigDecimal saldoAtual = conta.getSaldo();
        if (saldoAtual.compareTo(BigDecimal.ZERO) < 0) {
            BigDecimal divida = saldoAtual.abs();
            if (novoLimite.compareTo(divida) < 0) {
                novoLimite = divida;
            }
        }

        conta.setLimite(normalizarValorMonetario(novoLimite));
        repositorioContaEscrita.save(conta);
        
        System.out.println("SAGA [Sucesso]: Limite do CPF " + cpf + " atualizado para R$ " + novoLimite);
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
        OffsetDateTime dataMovimentacao = OffsetDateTime.now().truncatedTo(ChronoUnit.MILLIS);

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

    private void validarComandoCriacaoConta(ComandoCriacaoContaAprovacao comando) {
        if (comando == null) {
            throw new IllegalArgumentException("Comando de criacao de conta ausente");
        }
        if (estaEmBranco(comando.idSaga()) || estaEmBranco(comando.cpfCliente()) || estaEmBranco(comando.cpfGerenteResponsavel())) {
            throw new IllegalArgumentException("Dados obrigatorios da conta ausentes");
        }
        if (comando.salario() == null || comando.salario().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Salario invalido para abertura de conta");
        }
    }

    private BigDecimal calcularLimite(BigDecimal salario) {
        BigDecimal salarioNormalizado = normalizarValorMonetario(salario);
        if (salarioNormalizado.compareTo(new BigDecimal("2000.00")) < 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return normalizarValorMonetario(salarioNormalizado.divide(new BigDecimal("2.00"), RoundingMode.HALF_UP));
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        if (valor == null) {
            return BigDecimal.ZERO;
        }
        return valor;
    }

    private String gerarNumeroConta() {
        for (int tentativa = 0; tentativa < 100; tentativa++) {
            String numero = String.format("%04d", sorteador.nextInt(10000));
            if (!repositorioContaEscrita.existsById(numero)) {
                return numero;
            }
        }
        throw new IllegalStateException("Nao foi possivel gerar numero de conta livre");
    }

    private boolean estaEmBranco(String valor) {
        return valor == null || valor.isBlank();
    }

    private boolean deveCompensarConta(ContaEscrita conta, String idSaga, String cpfCliente) {
        return cpfCliente != null
            && cpfCliente.equals(conta.getCliente())
            && idSaga != null
            && idSaga.equals(conta.getIdSagaAprovacao());
    }

    private void marcarTransacaoAtualParaRollback() {
        try {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        } catch (Exception excecao) {
        }
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
