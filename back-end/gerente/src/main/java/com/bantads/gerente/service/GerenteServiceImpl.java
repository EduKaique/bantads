package com.bantads.gerente.service;

import com.bantads.gerente.dto.GerenteAtualizacaoDTO;
import com.bantads.gerente.dto.GerenteInsercaoDTO;
import com.bantads.gerente.dto.GerenteResponseDTO;
import com.bantads.gerente.model.Gerente;
import com.bantads.gerente.repository.GerenteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GerenteServiceImpl implements GerenteService {

    private final GerenteRepository repository;

    public GerenteServiceImpl(GerenteRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<GerenteResponseDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(this::toResponseDTO)
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

        return toResponseDTO(repository.save(gerente));
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
