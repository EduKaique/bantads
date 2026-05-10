package com.bantads.gerente.mensageria;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.bantads.gerente.repository.GerenteRepository;

@Component
public class OrquestradorSagaRemocaoGerente {

    private final PublicadorSagaRemocaoGerente publicador;
    private final GerenteRepository gerenteRepository;

    private final ConcurrentHashMap<String, EstadoSagaRemocao> estadosSagas = new ConcurrentHashMap<>();

    public OrquestradorSagaRemocaoGerente(
        PublicadorSagaRemocaoGerente publicador,
        GerenteRepository gerenteRepository
    ) {
        this.publicador = publicador;
        this.gerenteRepository = gerenteRepository;
    }

    @Transactional
    public void iniciarSaga(String sagaId, String cpfGerenteParaRemover) {
        long totalGerentes = gerenteRepository.count();
        if (totalGerentes <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido remover o último gerente do banco");
        }

        if (!gerenteRepository.existsByCpf(cpfGerenteParaRemover)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerente não encontrado");
        }

        EstadoSagaRemocao estado = new EstadoSagaRemocao();
        estado.setSagaId(sagaId);
        estado.setCpfGerenteParaRemover(cpfGerenteParaRemover);
        estado.setStatus("INICIADA");
        estado.setDataInicio(System.currentTimeMillis());

        estadosSagas.put(sagaId, estado);

        publicador.publicarConsultaGerenteMenosContas(sagaId, cpfGerenteParaRemover);
    }

    public void processarRespostaGerenteMenosContas(EventoRespostaGerenteMenosContas evento) {
        EstadoSagaRemocao estado = estadosSagas.get(evento.sagaId());

        if (estado == null) {
            System.err.println("SAGA não encontrada: " + evento.sagaId());
            return;
        }

        if (!evento.sucesso()) {
            estado.setStatus("ERRO");
            estado.setMensagem(evento.mensagem());
            return;
        }

        estado.setCpfGerenteMenosContas(evento.cpfGerenteMenosContas());
        estado.setStatus("GERENTE_MENOS_CONTAS_CONSULTADO");

        transferirContas(estado);
    }

    @Transactional
    private void transferirContas(EstadoSagaRemocao estado) {
        try {
            publicador.publicarTransferenciaContas(
                estado.getSagaId(),
                estado.getCpfGerenteParaRemover(),
                estado.getCpfGerenteMenosContas()
            );
            estado.setStatus("AGUARDANDO_TRANSFERENCIA_CONTAS");
        } catch (Exception e) {
            estado.setStatus("ERRO");
            estado.setMensagem("Erro ao iniciar transferência de contas: " + e.getMessage());
        }
    }

    public void processarRespostaTransferenciaContas(EventoRespostaTransferenciaContas evento) {
        EstadoSagaRemocao estado = estadosSagas.get(evento.sagaId());

        if (estado == null) {
            System.err.println("SAGA não encontrada: " + evento.sagaId());
            return;
        }

        if (!evento.sucesso()) {
            estado.setStatus("ERRO");
            estado.setMensagem("Erro ao transferir contas: " + evento.mensagem());
            return;
        }

        estado.setQuantidadeContasTransferidas(evento.totalContasTransferidas());
        estado.setStatus("CONTAS_TRANSFERIDAS");

        removerGerente(estado);
    }

    @Transactional
    private void removerGerente(EstadoSagaRemocao estado) {
        try {
            gerenteRepository.deleteByCpf(estado.getCpfGerenteParaRemover());
            estado.setStatus("CONCLUIDA");
        } catch (Exception e) {
            estado.setStatus("ERRO");
            estado.setMensagem("Erro ao remover gerente: " + e.getMessage());
        }
    }

    public EstadoSagaRemocao obterEstadoSaga(String sagaId) {
        return estadosSagas.get(sagaId);
    }

    public void limparSagasAntigas() {
        long tempoAtual = System.currentTimeMillis();
        long tempoLimite = 1000 * 60 * 60;

        estadosSagas.entrySet().removeIf(entry -> {
            EstadoSagaRemocao estado = entry.getValue();
            return (tempoAtual - estado.getDataInicio()) > tempoLimite;
        });
    }
}
