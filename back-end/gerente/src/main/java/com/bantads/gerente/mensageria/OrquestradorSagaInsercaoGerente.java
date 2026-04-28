package com.bantads.gerente.mensageria;

import java.math.BigDecimal;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;
import com.bantads.gerente.model.Gerente;
import com.bantads.gerente.repository.GerenteRepository;

@Component
public class OrquestradorSagaInsercaoGerente {

    private final PublicadorSagaInsercaoGerente publicador;
    private final GerenteRepository gerenteRepository;

    // Armazena o estado das SAGAs em progresso
    private final ConcurrentHashMap<String, EstadoSagaInsercao> estadosSagas = new ConcurrentHashMap<>();

    // Fila de SAGAs aguardando processamento
    private final ConcurrentLinkedQueue<String> filaProcessamento = new ConcurrentLinkedQueue<>();

    public OrquestradorSagaInsercaoGerente(
        PublicadorSagaInsercaoGerente publicador,
        GerenteRepository gerenteRepository
    ) {
        this.publicador = publicador;
        this.gerenteRepository = gerenteRepository;
    }

    /**
     * Inicia uma nova SAGA de inserção de gerente
     */
    @Transactional
    public void iniciarSaga(String sagaId, GerenteInsercaoDTO dto) {
        // Cria o estado inicial da SAGA
        EstadoSagaInsercao estado = new EstadoSagaInsercao();
        estado.setSagaId(sagaId);
        estado.setDto(dto);
        estado.setStatus("INICIADA");
        estado.setDataInicio(System.currentTimeMillis());

        estadosSagas.put(sagaId, estado);
        filaProcessamento.add(sagaId);

        // Publica a primeira mensagem: consultar gerente com mais contas
        publicador.publicarConsultaGerenteMaisContas(sagaId);
    }

    /**
     * Processa a resposta da consulta de gerente com mais contas
     */
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

        // Armazena as informações do gerente com mais contas
        estado.setCpfGerenteComMaisContas(evento.cpfGerenteComMaisContas());
        estado.setQuantidadeContasGerenteOrigem(evento.quantidadeContas());
        estado.setStatus("GERENTE_CONSULTADO");

        // Continua o fluxo: inserir o novo gerente
        inserirNovoGerente(estado);
    }

    /**
     * Insere o novo gerente no banco de dados
     */
    @Transactional
    private void inserirNovoGerente(EstadoSagaInsercao estado) {
        try {
            GerenteInsercaoDTO dto = estado.getDto();

            // Valida se o CPF já existe
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

            // Cria o novo gerente
            Gerente novoGerente = Gerente.builder()
                .cpf(dto.getCpf())
                .nome(dto.getNome())
                .email(dto.getEmail())
                .tipo("gerente")
                .build();

            Gerente gerenteSalvo = gerenteRepository.save(novoGerente);
            estado.setCpfNovoGerente(gerenteSalvo.getCpf());
            estado.setStatus("GERENTE_INSERIDO");

            // Define se deve atribuir conta ao novo gerente
            boolean deveAtribuirConta = verificarSeDeveAtribuirConta();
            estado.setDeveAtribuirConta(deveAtribuirConta);

            if (deveAtribuirConta) {
                // Publica mensagem para atribuir conta
                publicador.publicarSolicitacaoAtribuicaoConta(
                    estado.getSagaId(),
                    estado.getCpfNovoGerente(),
                    estado.getCpfGerenteComMaisContas()
                );
                estado.setStatus("AGUARDANDO_ATRIBUICAO_CONTA");
            } else {
                // SAGA concluída sem atribuir conta
                estado.setStatus("CONCLUIDA");
            }
        } catch (Exception e) {
            estado.setStatus("ERRO");
            estado.setMensagem("Erro ao inserir gerente: " + e.getMessage());
        }
    }

    /**
     * Processa a resposta de atribuição de conta
     */
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

    /**
     * Verifica se o novo gerente deve receber uma conta
     * Regras:
     * - Se for o primeiro gerente OU houver apenas um gerente com uma única conta -> sem conta
     * - Caso contrário -> recebe uma conta
     */
    private boolean verificarSeDeveAtribuirConta() {
        long totalGerentes = gerenteRepository.count();

        // Primeiro gerente do banco
        if (totalGerentes == 1) {
            return false;
        }

        // Se há apenas 2 gerentes e um deles tem apenas 1 conta
        if (totalGerentes == 2) {
            // Aqui você precisa consultar o MS Conta para saber quantas contas cada gerente tem
            // Por enquanto, vamos considerar que deve atribuir
            return true;
        }

        return true;
    }

    /**
     * Retorna o estado da SAGA
     */
    public EstadoSagaInsercao obterEstadoSaga(String sagaId) {
        return estadosSagas.get(sagaId);
    }

    /**
     * Limpa as SAGAs concluídas (para evitar memory leak)
     */
    public void limparSagasAntigas() {
        long tempoAtual = System.currentTimeMillis();
        long tempoLimite = 1000 * 60 * 60; // 1 hora

        estadosSagas.entrySet().removeIf(entry -> {
            EstadoSagaInsercao estado = entry.getValue();
            return (tempoAtual - estado.getDataInicio()) > tempoLimite;
        });
    }
}
