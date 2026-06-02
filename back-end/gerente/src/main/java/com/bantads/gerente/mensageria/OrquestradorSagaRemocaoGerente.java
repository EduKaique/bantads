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
        // A remocao do ultimo gerente quebraria a regra de haver responsavel por clientes.
        if (totalGerentes <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido remover o último gerente do banco");
        }

        // Antes de acionar filas, valida-se se o alvo realmente existe no banco local.
        if (!gerenteRepository.existsByCpf(cpfGerenteParaRemover)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerente não encontrado");
        }

        // Apenas outros gerentes podem receber as contas vinculadas ao gerente removido.
        var cpfsGerentesCandidatos = gerenteRepository.findAll()
            .stream()
            .filter(gerente -> "GERENTE".equalsIgnoreCase(gerente.getTipo()))
            .map(gerente -> gerente.getCpf())
            .filter(cpf -> !cpf.equals(cpfGerenteParaRemover))
            .toList();

        if (cpfsGerentesCandidatos.isEmpty()) {
            // Sem candidato valido, a remocao ficaria sem destino para as contas do cliente.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao ha outro gerente para receber as contas");
        }

        // O estado fica disponivel antes da consulta ao gerente com menor carga de contas.
        EstadoSagaRemocao estado = new EstadoSagaRemocao();
        estado.setSagaId(sagaId);
        estado.setCpfGerenteParaRemover(cpfGerenteParaRemover);
        estado.setStatus("INICIADA");
        estado.setDataInicio(System.currentTimeMillis());

        estadosSagas.put(sagaId, estado);

        publicador.publicarConsultaGerenteMenosContas(
            sagaId,
            cpfGerenteParaRemover,
            cpfsGerentesCandidatos
        );
    }

    public void processarRespostaGerenteMenosContas(EventoRespostaGerenteMenosContas evento) {
        // A resposta escolhe o gerente destino para manter a distribuicao mais equilibrada.
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
            // A transferencia e delegada ao servico de contas, que conhece os vinculos reais.
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

    @Transactional
    public void processarRespostaTransferenciaContas(EventoRespostaTransferenciaContas evento) {
        // O gerente so e removido depois da confirmacao de que suas contas foram migradas.
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
            // A exclusao local finaliza a saga depois que nao ha mais contas dependentes.
            var gerente = gerenteRepository.findByCpf(estado.getCpfGerenteParaRemover())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerente nao encontrado"));

            gerenteRepository.delete(gerente);
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
        // Remove estados antigos para evitar crescimento indefinido do mapa em memoria.
        long tempoLimite = 1000 * 60 * 60;

        estadosSagas.entrySet().removeIf(entry -> {
            EstadoSagaRemocao estado = entry.getValue();
            return (tempoAtual - estado.getDataInicio()) > tempoLimite;
        });
    }
}
