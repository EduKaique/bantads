package com.bantads.gerente.service;

import com.bantads.gerente.dto.GerenteAtualizacaoDTO;
import com.bantads.gerente.dto.GerenteDashboardDTO;
import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;
import com.bantads.gerente.mensageria.EventoAlteracaoGerenteInterno;
import com.bantads.gerente.mensageria.GerenteAtualizadoEvent;
import com.bantads.gerente.model.Gerente;
import com.bantads.gerente.repository.GerenteRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class GerenteServiceImpl implements GerenteService {

    private final GerenteRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    public GerenteServiceImpl(GerenteRepository repository, ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public List<GerenteResponseDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<GerenteDashboardDTO> listarDashboard() {
        return repository.findAll()
                .stream()
                .map(gerente -> GerenteDashboardDTO.builder()
                        .gerente(this.toResponseDTO(gerente))
                        .clientes(new ArrayList<>())          
                        .saldoPositivo(0.0)                   
                        .saldoNegativo(0.0)
                        .build()
                )
                .toList();
    }

    @Override
    public GerenteResponseDTO buscarPorCpf(String cpf) {
        Gerente gerente = repository.findByCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerente não encontrado"));
        return toResponseDTO(gerente);
    }

    @Override
    @Transactional
    public GerenteResponseDTO inserir(GerenteInsercaoDTO dto) {
        if (repository.existsByCpf(dto.getCpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        if (repository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }

        Gerente gerente = Gerente.builder()
                .cpf(dto.getCpf())
                .nome(dto.getNome())
                .email(dto.getEmail())
                .tipo(dto.getTipo())
                .telefone(dto.getTelefone())
                .build();

        return toResponseDTO(repository.save(gerente));
    }

    @Override
    @Transactional
    public GerenteResponseDTO atualizar(String cpf, GerenteAtualizacaoDTO dto) {
        Gerente gerente = repository.findByCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerente não encontrado"));

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            gerente.setNome(dto.getNome());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            if (!gerente.getEmail().equals(dto.getEmail()) && repository.existsByEmail(dto.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
            }
            gerente.setEmail(dto.getEmail());
        }

        Gerente gerenteSalvo = repository.save(gerente);
        GerenteAtualizadoEvent evento = new GerenteAtualizadoEvent(
                gerenteSalvo.getCpf(),
                gerenteSalvo.getNome(),
                gerenteSalvo.getEmail(),
                dto.getSenha()
        );
        eventPublisher.publishEvent(new EventoAlteracaoGerenteInterno(evento));

        return toResponseDTO(gerenteSalvo);
    }

    @Override
    @Transactional
    public GerenteResponseDTO remover(String cpf) {
        Gerente gerente = repository.findByCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerente não encontrado"));
        repository.delete(gerente);
        return toResponseDTO(gerente);
    }

    private GerenteResponseDTO toResponseDTO(Gerente gerente) {
        return GerenteResponseDTO.builder()
                .cpf(gerente.getCpf())
                .nome(gerente.getNome())
                .email(gerente.getEmail())
                .tipo(gerente.getTipo())
                .build();
    }
}
