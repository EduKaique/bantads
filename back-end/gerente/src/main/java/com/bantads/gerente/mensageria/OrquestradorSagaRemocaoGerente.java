package com.bantads.gerente.mensageria;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.gerente.repository.EstadoSagaRemocaoRepository;
import com.bantads.gerente.repository.GerenteRepository;

@Component
public class OrquestradorSagaRemocaoGerente {

    private static final String STATUS_INICIADA = "INICIADA";
    private static final String STATUS_GERENTE_CONSULTADO = "GERENTE_MENOS_CONTAS_CONSULTADO";
    private static final String STATUS_AGUARDANDO_TRANSFERENCIA = "AGUARDANDO_TRANSFERENCIA_CONTAS";
    private static final String STATUS_CONTAS_TRANSFERIDAS = "CONTAS_TRANSFERIDAS";
    private static final String STATUS_CONCLUIDA = "CONCLUIDA";
    private static final String STATUS_AGUARDANDO_COMPENSACAO = "AGUARDANDO_COMPENSACAO_TRANSFERENCIA";
    private static final String STATUS_COMPENSADA = "COMPENSADA";
    private static final String STATUS_ERRO = "ERRO";
    private static final String STATUS_ERRO_COMPENSACAO = "ERRO_COMPENSACAO";

    private final PublicadorSagaRemocaoGerente publicador;
    private final GerenteRepository gerenteRepository;
    private final EstadoSagaRemocaoRepository estadoSagaRepository;

    public OrquestradorSagaRemocaoGerente(
        PublicadorSagaRemocaoGerente publicador,
        GerenteRepository gerenteRepository,
        EstadoSagaRemocaoRepository estadoSagaRepository
    ) {
        this.publicador = publicador;
        this.gerenteRepository = gerenteRepository;
        this.estadoSagaRepository = estadoSagaRepository;
    }

    public void iniciarSaga(String sagaId, String cpfGerenteParaRemover) {
        long totalGerentes = gerenteRepository.count();
        if (totalGerentes <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao e permitido remover o ultimo gerente do banco");
        }

        if (!gerenteRepository.existsByCpf(cpfGerenteParaRemover)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerente nao encontrado");
        }

        var cpfsGerentesCandidatos = gerenteRepository.findAll()
            .stream()
            .filter(gerente -> "GERENTE".equalsIgnoreCase(gerente.getTipo()))
            .map(gerente -> gerente.getCpf())
            .filter(cpf -> !cpf.equals(cpfGerenteParaRemover))
            .toList();

        if (cpfsGerentesCandidatos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao ha outro gerente para receber as contas");
        }

        EstadoSagaRemocao estado = new EstadoSagaRemocao();
        estado.setSagaId(sagaId);
        estado.setCpfGerenteParaRemover(cpfGerenteParaRemover);
        estado.setStatus(STATUS_INICIADA);
        estado.setDataInicio(System.currentTimeMillis());

        salvarEstado(estado);

        try {
            publicador.publicarConsultaGerenteMenosContas(
                sagaId,
                cpfGerenteParaRemover,
                cpfsGerentesCandidatos
            );
        } catch (Exception e) {
            marcarErro(estado, "Erro ao consultar gerente destino: " + e.getMessage());
            throw e;
        }
    }

    public void processarRespostaGerenteMenosContas(EventoRespostaGerenteMenosContas evento) {
        EstadoSagaRemocao estado = obterEstadoOuAvisar(evento.sagaId());

        if (estado == null || isFinalizado(estado)) {
            return;
        }

        if (!evento.sucesso()) {
            marcarErro(estado, evento.mensagem());
            return;
        }

        estado.setCpfGerenteMenosContas(evento.cpfGerenteMenosContas());
        estado.setStatus(STATUS_GERENTE_CONSULTADO);
        salvarEstado(estado);

        transferirContas(estado);
    }

    private void transferirContas(EstadoSagaRemocao estado) {
        try {
            estado.setStatus(STATUS_AGUARDANDO_TRANSFERENCIA);
        salvarEstado(estado);

            publicador.publicarTransferenciaContas(
                estado.getSagaId(),
                estado.getCpfGerenteParaRemover(),
                estado.getCpfGerenteMenosContas()
            );
        } catch (Exception e) {
            marcarErro(estado, "Erro ao iniciar transferencia de contas: " + e.getMessage());
        }
    }

    public void processarRespostaTransferenciaContas(EventoRespostaTransferenciaContas evento) {
        EstadoSagaRemocao estado = obterEstadoOuAvisar(evento.sagaId());

        if (estado == null) {
            return;
        }

        String operacao = normalizarOperacao(evento.operacao());

        if (PublicadorSagaRemocaoGerente.OPERACAO_COMPENSAR.equals(operacao)) {
            processarRespostaCompensacao(estado, evento);
            return;
        }

        if (isFinalizado(estado) || STATUS_AGUARDANDO_COMPENSACAO.equals(estado.getStatus())) {
            return;
        }

        if (!evento.sucesso()) {
            marcarErro(estado, "Erro ao transferir contas: " + evento.mensagem());
            return;
        }

        estado.setQuantidadeContasTransferidas(evento.totalContasTransferidas());
        estado.setStatus(STATUS_CONTAS_TRANSFERIDAS);
        salvarEstado(estado);

        removerGerente(estado);
    }

    private void removerGerente(EstadoSagaRemocao estado) {
        try {
            var gerente = gerenteRepository.findByCpf(estado.getCpfGerenteParaRemover());

            if (gerente.isEmpty()) {
                estado.setStatus(STATUS_CONCLUIDA);
                estado.setMensagem("Gerente ja removido anteriormente");
                salvarEstado(estado);
                return;
            }

            gerenteRepository.delete(gerente.get());
            gerenteRepository.flush();

            estado.setStatus(STATUS_CONCLUIDA);
            estado.setMensagem("Gerente removido e contas transferidas");
            salvarEstado(estado);
        } catch (Exception e) {
            iniciarCompensacao(estado, "Erro ao remover gerente: " + e.getMessage());
        }
    }

    private void iniciarCompensacao(EstadoSagaRemocao estado, String motivo) {
        try {
            estado.setStatus(STATUS_AGUARDANDO_COMPENSACAO);
            estado.setMensagem(motivo + ". Compensacao solicitada.");
            salvarEstado(estado);

            publicador.publicarCompensacaoTransferenciaContas(
                estado.getSagaId(),
                estado.getCpfGerenteParaRemover(),
                estado.getCpfGerenteMenosContas()
            );
        } catch (Exception e) {
            estado.setStatus(STATUS_ERRO_COMPENSACAO);
            estado.setMensagem(motivo + ". Erro ao publicar compensacao: " + e.getMessage());
            salvarEstado(estado);
        }
    }

    private void processarRespostaCompensacao(
        EstadoSagaRemocao estado,
        EventoRespostaTransferenciaContas evento
    ) {
        if (STATUS_CONCLUIDA.equals(estado.getStatus()) || STATUS_COMPENSADA.equals(estado.getStatus())) {
            return;
        }

        estado.setQuantidadeContasTransferidas(evento.totalContasTransferidas());

        if (evento.sucesso()) {
            estado.setStatus(STATUS_COMPENSADA);
            estado.setMensagem("Remocao cancelada e transferencia de contas compensada: " + evento.mensagem());
        } else {
            estado.setStatus(STATUS_ERRO_COMPENSACAO);
            estado.setMensagem("Erro ao compensar transferencia de contas: " + evento.mensagem());
        }

            salvarEstado(estado);
    }

    public EstadoSagaRemocao obterEstadoSaga(String sagaId) {
        return estadoSagaRepository.findById(sagaId).orElse(null);
    }

    public void limparSagasAntigas() {
        long tempoAtual = System.currentTimeMillis();
        long tempoLimite = 1000 * 60 * 60;

        var sagasAntigas = estadoSagaRepository.findAll()
            .stream()
            .filter(estado -> (tempoAtual - estado.getDataInicio()) > tempoLimite)
            .toList();

        estadoSagaRepository.deleteAll(sagasAntigas);
    }

    private EstadoSagaRemocao obterEstadoOuAvisar(String sagaId) {
        EstadoSagaRemocao estado = obterEstadoSaga(sagaId);

        if (estado == null) {
            System.err.println("SAGA nao encontrada: " + sagaId);
        }

        return estado;
    }

    private void marcarErro(EstadoSagaRemocao estado, String mensagem) {
        estado.setStatus(STATUS_ERRO);
        estado.setMensagem(mensagem);
        salvarEstado(estado);
    }

    private void salvarEstado(EstadoSagaRemocao estado) {
        estadoSagaRepository.save(estado);
        System.out.println(
            "[SAGA REMOCAO GERENTE] sagaId=" + estado.getSagaId()
                + " status=" + estado.getStatus()
                + " gerenteRemovido=" + estado.getCpfGerenteParaRemover()
                + " gerenteDestino=" + estado.getCpfGerenteMenosContas()
                + " contasTransferidas=" + estado.getQuantidadeContasTransferidas()
                + " mensagem=" + estado.getMensagem()
        );
    }

    private boolean isFinalizado(EstadoSagaRemocao estado) {
        String status = estado.getStatus();
        return STATUS_CONCLUIDA.equals(status)
            || STATUS_COMPENSADA.equals(status)
            || STATUS_ERRO.equals(status)
            || STATUS_ERRO_COMPENSACAO.equals(status);
    }

    private String normalizarOperacao(String operacao) {
        if (operacao == null || operacao.isBlank()) {
            return PublicadorSagaRemocaoGerente.OPERACAO_TRANSFERIR;
        }

        return operacao.toUpperCase();
    }
}
