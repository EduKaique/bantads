package com.bantads.cliente.service;

import com.bantads.cliente.dto.*;
import com.bantads.cliente.model.Cliente;
import com.bantads.cliente.model.StatusCliente;
import com.bantads.cliente.repository.ClienteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteServiceImpl(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    @Transactional
    public void autocadastrar(AutocadastroInfoDTO dto) {
        if (clienteRepository.existsById(dto.getCpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cliente já cadastrado ou aguardando aprovação, CPF duplicado");
        }
        if (clienteRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "E-mail já cadastrado");
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

        cliente.setStatus(StatusCliente.PENDENTE);

        clienteRepository.save(cliente);
    }

    @Override
    public ClienteResponseDTO buscarPorCpf(String cpf) {
        Cliente cliente = clienteRepository.findById(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cliente não encontrado"));
        return ClienteResponseDTO.fromEntity(cliente);
    }

    @Override
    public List<ClienteParaAprovarResponseDTO> listarParaAprovar() {
        return clienteRepository.findByStatus(StatusCliente.PENDENTE)
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cliente não encontrado"));

        if (dto.getNome() != null) cliente.setNome(dto.getNome());
        if (dto.getEmail() != null) cliente.setEmail(dto.getEmail());
        if (dto.getSalario() != null) cliente.setSalario(dto.getSalario());

        // --- NOVOS CAMPOS DE ENDEREÇO ---
        if (dto.getCep() != null) cliente.setCep(dto.getCep());
        if (dto.getLogradouro() != null) cliente.setLogradouro(dto.getLogradouro());
        if (dto.getNumero() != null) cliente.setNumero(dto.getNumero());
        if (dto.getComplemento() != null) cliente.setComplemento(dto.getComplemento());
        if (dto.getBairro() != null) cliente.setBairro(dto.getBairro());
        if (dto.getCidade() != null) cliente.setCidade(dto.getCidade());
        if (dto.getEstado() != null) cliente.setEstado(dto.getEstado());

        clienteRepository.save(cliente);
    }

    @Override
    @Transactional
    public void aprovar(String cpf) {
        Cliente cliente = clienteRepository.findById(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cliente não encontrado"));
        cliente.setStatus(StatusCliente.APROVADO);
        clienteRepository.save(cliente);
    }

    @Override
    @Transactional
    public void rejeitar(String cpf, MotivoRejeicaoDTO motivo) {
        Cliente cliente = clienteRepository.findById(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cliente não encontrado"));
        cliente.setStatus(StatusCliente.REJEITADO);
                
        clienteRepository.save(cliente);
    }
}