package com.bantads.gerente.mensageria;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.model.Gerente;
import com.bantads.gerente.repository.GerenteRepository;

@Component
public class OrquestradorSagaInsercaoGerente {

    private final PublicadorSagaInsercaoGerente publicador;
    private final GerenteRepository gerenteRepository;

    private final ConcurrentHashMap<String, EstadoSagaInsercao> estadosSagas = new ConcurrentHashMap<>();

    public OrquestradorSagaInsercaoGerente(
        PublicadorSagaInsercaoGerente publicador,
        GerenteRepository gerenteRepository
    ) {
        this.publicador = publicador;
        this.gerenteRepository = gerenteRepository;
    }

    @Transactional
    public void iniciarSaga(String sagaId, GerenteInsercaoDTO dto) {
        // A primeira etapa registra o estado antes de publicar qualquer mensagem.
        // Assim respostas muito rapidas dos consumidores ainda encontram a saga no mapa.
        EstadoSagaInsercao estado = new EstadoSagaInsercao();
        estado.setSagaId(sagaId);
        estado.setDto(dto);
        estado.setStatus("INICIADA");
        estado.setDataInicio(System.currentTimeMillis());

        estadosSagas.put(sagaId, estado);

        publicador.publicarConsultaGerenteMaisContas(sagaId);
    }

    public void processarRespostaGerenteMaisContas(EventoRespostaGerenteMaisContas evento) {
        // A resposta informa qual gerente concentra mais contas para equilibrar a carteira.
        // Se a consulta falhar, a saga para antes de persistir o novo gerente.
        EstadoSagaInsercao estado = estadosSagas.get(evento.sagaId());

        if (estado == null) {
            System.err.println("SAGA não encontrada: " + evento.sagaId());
            return;
        }

        if (!evento.sucesso()) {
            estado.setStatus("ERRO");
            estado.setMensagem(evento.mensagem());
            return;
        }

        estado.setCpfGerenteComMaisContas(evento.cpfGerenteComMaisContas());
        estado.setQuantidadeContasGerenteOrigem(evento.quantidadeContas());
        estado.setStatus("GERENTE_CONSULTADO");

        inserirNovoGerente(estado);
    }

    @Transactional
    private void inserirNovoGerente(EstadoSagaInsercao estado) {
        try {
            GerenteInsercaoDTO dto = estado.getDto();

            // CPF e email sao barreiras locais antes de qualquer transferencia de carteira.
            if (gerenteRepository.existsByCpf(dto.getCpf())) {
                estado.setStatus("ERRO");
                estado.setMensagem("CPF já cadastrado");
                return;
            }

            if (gerenteRepository.existsByEmail(dto.getEmail())) {
                estado.setStatus("ERRO");
                estado.setMensagem("Email já cadastrado");
                return;
            }

            Gerente novoGerente = Gerente.builder()
                .cpf(dto.getCpf())
                .nome(dto.getNome())
                .email(dto.getEmail())
                .tipo("gerente")
                .build();

            Gerente gerenteSalvo = gerenteRepository.save(novoGerente);
            estado.setCpfNovoGerente(gerenteSalvo.getCpf());
            estado.setStatus("GERENTE_INSERIDO");

            // A atribuicao so faz sentido quando existe outro gerente com contas para dividir.
            boolean deveAtribuirConta = gerenteRepository.count() > 1
                && estado.getCpfGerenteComMaisContas() != null
                && !estado.getCpfGerenteComMaisContas().isBlank();

            estado.setDeveAtribuirConta(deveAtribuirConta);

            if (deveAtribuirConta) {
                publicador.publicarSolicitacaoAtribuicaoConta(
                    estado.getSagaId(),
                    estado.getCpfNovoGerente(),
                    estado.getCpfGerenteComMaisContas()
                );
                estado.setStatus("AGUARDANDO_ATRIBUICAO_CONTA");
            } else {
                estado.setStatus("CONCLUIDA");
            }
        } catch (Exception e) {
            estado.setStatus("ERRO");
            estado.setMensagem("Erro ao inserir gerente: " + e.getMessage());
        }
    }

    public void processarRespostaAtribuicaoConta(EventoRespostaAtribuicaoConta evento) {
        // Esta etapa encerra a saga quando o servico de contas confirma a redistribuicao.
        EstadoSagaInsercao estado = estadosSagas.get(evento.sagaId());

        if (estado == null) {
            System.err.println("SAGA não encontrada: " + evento.sagaId());
            return;
        }

        if (!evento.sucesso()) {
            estado.setStatus("ERRO");
            estado.setMensagem("Erro ao atribuir conta: " + evento.mensagem());
        } else {
            estado.setStatus("CONCLUIDA");
        }
    }

    public EstadoSagaInsercao obterEstadoSaga(String sagaId) {
        return estadosSagas.get(sagaId);
    }

    public void limparSagasAntigas() {
        long tempoAtual = System.currentTimeMillis();
        // Mantem o mapa enxuto sem depender de armazenamento permanente para historico.
        long tempoLimite = 1000 * 60 * 60;

        estadosSagas.entrySet().removeIf(entry -> {
            EstadoSagaInsercao estado = entry.getValue();
            return (tempoAtual - estado.getDataInicio()) > tempoLimite;
        });
    }
}
