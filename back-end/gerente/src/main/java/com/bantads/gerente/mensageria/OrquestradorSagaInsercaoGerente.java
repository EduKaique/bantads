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
        EstadoSagaInsercao estado = new EstadoSagaInsercao();
        estado.setSagaId(sagaId);
        estado.setDto(dto);
        estado.setStatus("INICIADA");
        estado.setDataInicio(System.currentTimeMillis());

        estadosSagas.put(sagaId, estado);

        publicador.publicarConsultaGerenteMaisContas(sagaId);
    }

    public void processarRespostaGerenteMaisContas(EventoRespostaGerenteMaisContas evento) {
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
                .telefone(dto.getTelefone())
                .build();

            Gerente gerenteSalvo = gerenteRepository.save(novoGerente);
            estado.setCpfNovoGerente(gerenteSalvo.getCpf());
            estado.setStatus("GERENTE_INSERIDO");

            ComandoCriacaoAcessoGerente comandoAcesso = new ComandoCriacaoAcessoGerente(
                dto.getCpf(),
                dto.getNome(),
                dto.getEmail(),
                dto.getSenha(),
                "GERENTE"
            );
            publicador.publicarCriacaoAcessoGerente(comandoAcesso);

            String cpfGerenteComMaisContas = estado.getCpfGerenteComMaisContas();
            boolean deveAtribuirConta = gerenteRepository.count() > 1
                && cpfGerenteComMaisContas != null
                && !cpfGerenteComMaisContas.isBlank();

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
        long tempoLimite = 1000 * 60 * 60;

        estadosSagas.entrySet().removeIf(entry -> {
            EstadoSagaInsercao estado = entry.getValue();
            return (tempoAtual - estado.getDataInicio()) > tempoLimite;
        });
    }
}
