package com.bantads.cliente.service;

import com.bantads.cliente.config.RabbitMqConfiguracao;
import com.bantads.cliente.dto.AutocadastroInfoDTO;
import com.bantads.cliente.dto.ClienteParaAprovarResponseDTO;
import com.bantads.cliente.dto.ClienteResponseDTO;
import com.bantads.cliente.dto.MotivoRejeicaoDTO;
import com.bantads.cliente.dto.PerfilInfoDTO;
import com.bantads.cliente.dto.RespostaAprovacaoClienteDTO;
import com.bantads.cliente.mensageria.ClienteAtualizadoEvent;
import com.bantads.cliente.mensageria.EventoAlteracaoPerfilInterno;
import com.bantads.cliente.mensageria.aprovacao.OrquestradorAprovacaoCliente;
import com.bantads.cliente.mensageria.autocadastro.EventoSolicitacaoGerenteAutocadastro;
import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.model.SagaAprovacaoCliente;
import com.bantads.cliente.model.StatusCliente;
import com.bantads.cliente.model.StatusSagaAprovacaoCliente;
import com.bantads.cliente.repository.ClienteRepository;
import com.bantads.cliente.repository.RepositorioSagaAprovacaoCliente;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService {

    private static final String TIPO_GERENTE = "GERENTE";
    private static final List<StatusSagaAprovacaoCliente> STATUS_ATIVOS = List.of(
        StatusSagaAprovacaoCliente.INICIADA,
        StatusSagaAprovacaoCliente.AGUARDANDO_CONTA,
        StatusSagaAprovacaoCliente.CONTA_CRIADA,
        StatusSagaAprovacaoCliente.AGUARDANDO_AUTH,
        StatusSagaAprovacaoCliente.AUTH_CRIADO,
        StatusSagaAprovacaoCliente.COMPENSANDO
    );

    private final ClienteRepository clienteRepository;
    private final RepositorioSagaAprovacaoCliente repositorioSaga;
    private final OrquestradorAprovacaoCliente orquestradorAprovacao; // <-- Restaurado
    private final ApplicationEventPublisher eventPublisher;
    private final RabbitTemplate rabbitTemplate; // <-- Mantido para o Autocadastro

    public ClienteServiceImpl(
        ClienteRepository clienteRepository,
        RepositorioSagaAprovacaoCliente repositorioSaga,
        OrquestradorAprovacaoCliente orquestradorAprovacao,
        ApplicationEventPublisher eventPublisher,
        RabbitTemplate rabbitTemplate
    ) {
        this.clienteRepository = clienteRepository;
        this.repositorioSaga = repositorioSaga;
        this.orquestradorAprovacao = orquestradorAprovacao;
        this.eventPublisher = eventPublisher;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    @Transactional
    public void autocadastrar(AutocadastroInfoDTO dto) {
        if (clienteRepository.existsById(dto.getCpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cliente ja cadastrado ou aguardando aprovacao, CPF duplicado");
        }
        if (clienteRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }

        Cliente cliente = new Cliente();
        cliente.setCpf(dto.getCpf());
        cliente.setNome(dto.getNome());
        cliente.setEmail(dto.getEmail());
        cliente.setTelefone(dto.getTelefone());
        cliente.setSalario(dto.getSalario());

        cliente.setCep(dto.getCep());
        cliente.setLogradouro(dto.getLogradouro());
        cliente.setNumero(dto.getNumero());
        cliente.setComplemento(dto.getComplemento());
        cliente.setBairro(dto.getBairro());
        cliente.setCidade(dto.getCidade());
        cliente.setEstado(dto.getEstado());

        // O gerente é nulo na criação! A SAGA vai preencher depois.
        cliente.setCpfGerenteResponsavel(null); 
        cliente.setStatus(StatusCliente.PENDENTE);

        clienteRepository.save(cliente);

        // DISPARO DA SAGA DE AUTOCADASTRO
        EventoSolicitacaoGerenteAutocadastro evento = new EventoSolicitacaoGerenteAutocadastro(cliente.getCpf());
        rabbitTemplate.convertAndSend(
                RabbitMqConfiguracao.EXCHANGE_AUTOCADASTRO,
                RabbitMqConfiguracao.CHAVE_SOLICITACAO_GERENTE,
                evento
        );
    }

    @Override
    public ClienteResponseDTO buscarPorCpf(String cpf) {
        Cliente cliente = clienteRepository.findById(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));
        return ClienteResponseDTO.fromEntity(cliente);
    }

    @Override
    public List<ClienteParaAprovarResponseDTO> listarParaAprovar(
        String cpfGerenteSolicitante,
        String tipoUsuario,
        String cpfGerenteFiltro
    ) {
        validarGerente(cpfGerenteSolicitante, tipoUsuario);
        String cpfGerente = resolverCpfGerenteConsulta(cpfGerenteSolicitante, cpfGerenteFiltro);

        return clienteRepository.findByStatusAndCpfGerenteResponsavel(StatusCliente.PENDENTE, cpfGerente)
                .stream()
                .map(ClienteParaAprovarResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findByStatus(StatusCliente.APROVADO)
                .stream()
                .map(ClienteResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void alterarPerfil(String cpf, PerfilInfoDTO dto) {
        Cliente cliente = clienteRepository.findById(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));

        if (dto.getNome() != null) cliente.setNome(dto.getNome());
        if (dto.getEmail() != null) cliente.setEmail(dto.getEmail());
        if (dto.getSalario() != null) cliente.setSalario(dto.getSalario());

        if (dto.getCep() != null) cliente.setCep(dto.getCep());
        if (dto.getLogradouro() != null) cliente.setLogradouro(dto.getLogradouro());
        if (dto.getNumero() != null) cliente.setNumero(dto.getNumero());
        if (dto.getComplemento() != null) cliente.setComplemento(dto.getComplemento());
        if (dto.getBairro() != null) cliente.setBairro(dto.getBairro());
        if (dto.getCidade() != null) cliente.setCidade(dto.getCidade());
        if (dto.getEstado() != null) cliente.setEstado(dto.getEstado());

        clienteRepository.save(cliente);
        ClienteAtualizadoEvent payload = new ClienteAtualizadoEvent(
                cliente.getCpf(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getSalario()
        );
        eventPublisher.publishEvent(new EventoAlteracaoPerfilInterno(payload));
    }

    @Override
    @Transactional
    public RespostaAprovacaoClienteDTO aprovar(String cpf, String cpfGerenteSolicitante, String tipoUsuario) {
        validarGerente(cpfGerenteSolicitante, tipoUsuario);

        Cliente cliente = clienteRepository.findByCpfParaAtualizar(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));

        Optional<SagaAprovacaoCliente> sagaAtiva =
            repositorioSaga.findFirstByCpfClienteAndStatusInOrderByCriadaEmDesc(cpf, STATUS_ATIVOS);
        if (sagaAtiva.isPresent()) {
            validarAcessoSaga(sagaAtiva.get(), cpfGerenteSolicitante);
            return RespostaAprovacaoClienteDTO.deEntidade(sagaAtiva.get());
        }

        validarClienteParaAprovacao(cliente, cpfGerenteSolicitante);

        SagaAprovacaoCliente saga = criarSaga(cliente, cpfGerenteSolicitante);
        cliente.setStatus(StatusCliente.EM_APROVACAO);
        clienteRepository.save(cliente);

        // <-- Restaurada a chamada ao orquestrador para a SAGA de Aprovação
        SagaAprovacaoCliente sagaIniciada = orquestradorAprovacao.iniciar(saga, cliente); 
        return RespostaAprovacaoClienteDTO.deEntidade(sagaIniciada);
    }

    @Override
    public RespostaAprovacaoClienteDTO consultarAprovacao(String idSaga, String cpfGerenteSolicitante, String tipoUsuario) {
        validarGerente(cpfGerenteSolicitante, tipoUsuario);
        SagaAprovacaoCliente saga = repositorioSaga.findById(idSaga)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aprovacao nao encontrada"));

        validarAcessoSaga(saga, cpfGerenteSolicitante);

        return RespostaAprovacaoClienteDTO.deEntidade(saga);
    }

    @Override
    @Transactional
    public void rejeitar(String cpf, MotivoRejeicaoDTO motivo) {
        Cliente cliente = clienteRepository.findById(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));
        cliente.setStatus(StatusCliente.REJEITADO);

        clienteRepository.save(cliente);
    }

    private SagaAprovacaoCliente criarSaga(Cliente cliente, String cpfGerenteSolicitante) {
        SagaAprovacaoCliente saga = new SagaAprovacaoCliente();
        saga.setIdSaga(UUID.randomUUID().toString());
        saga.setCpfCliente(cliente.getCpf());
        saga.setCpfGerenteSolicitante(cpfGerenteSolicitante);
        saga.setCpfGerenteResponsavel(cliente.getCpfGerenteResponsavel());
        saga.setStatus(StatusSagaAprovacaoCliente.INICIADA);
        saga.setEtapaAtual("INICIADA");
        saga.setEmailCliente(cliente.getEmail());
        return saga;
    }

    private void validarClienteParaAprovacao(Cliente cliente, String cpfGerenteSolicitante) {
        if (cliente.getStatus() == StatusCliente.APROVADO || cliente.getStatus() == StatusCliente.REJEITADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cliente nao esta pendente para aprovacao");
        }
        if (cliente.getStatus() == StatusCliente.EM_APROVACAO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cliente ja possui aprovacao em andamento");
        }
        if (cliente.getStatus() != StatusCliente.PENDENTE && cliente.getStatus() != StatusCliente.FALHA_APROVACAO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Status do cliente nao permite aprovacao");
        }
        if (estaEmBranco(cliente.getCpfGerenteResponsavel())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente sem gerente responsavel");
        }
        if (!cpfGerenteSolicitante.equals(cliente.getCpfGerenteResponsavel())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Gerente nao autorizado para aprovar este cliente");
        }
        if (cliente.getSalario() == null || cliente.getSalario() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Salário invalido para abertura de conta");
        }
        if (estaEmBranco(cliente.getNome()) || estaEmBranco(cliente.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados obrigatorios do cliente incompletos");
        }
    }

    private void validarGerente(String cpfGerenteSolicitante, String tipoUsuario) {
        if (estaEmBranco(cpfGerenteSolicitante) || estaEmBranco(tipoUsuario)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contexto de usuario autenticado ausente");
        }
        if (!TIPO_GERENTE.equalsIgnoreCase(tipoUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario autenticado nao e gerente");
        }
    }

    private void validarAcessoSaga(SagaAprovacaoCliente saga, String cpfGerenteSolicitante) {
        if (!cpfGerenteSolicitante.equals(saga.getCpfGerenteSolicitante())
            && !cpfGerenteSolicitante.equals(saga.getCpfGerenteResponsavel())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Gerente nao autorizado para esta aprovacao");
        }
    }

    private String resolverCpfGerenteConsulta(String cpfGerenteSolicitante, String cpfGerenteFiltro) {
        if (estaEmBranco(cpfGerenteFiltro)) {
            return cpfGerenteSolicitante;
        }
        if (!cpfGerenteSolicitante.equals(cpfGerenteFiltro)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Gerente nao autorizado para esta listagem");
        }
        return cpfGerenteFiltro;
    }

    private boolean estaEmBranco(String valor) {
        return valor == null || valor.isBlank();
    }
}