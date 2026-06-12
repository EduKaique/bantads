package com.bantads.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;

@Service
public class SeedService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void seed() {
        String senha = passwordEncoder.encode("tads");

        criarUsuario("cli1@bantads.com.br", senha, TipoUsuario.CLIENTE, "Catharyna", "12912861012");
        criarUsuario("cli2@bantads.com.br", senha, TipoUsuario.CLIENTE, "Cleuddônio", "09506382000");
        criarUsuario("cli3@bantads.com.br", senha, TipoUsuario.CLIENTE, "Catianna", "85733854057");
        criarUsuario("cli4@bantads.com.br", senha, TipoUsuario.CLIENTE, "Cutardo", "58872160006");
        criarUsuario("cli5@bantads.com.br", senha, TipoUsuario.CLIENTE, "Coândrya", "76179646090");
        criarUsuario("ger1@bantads.com.br", senha, TipoUsuario.GERENTE, "Geniéve", "98574307084");
        criarUsuario("ger2@bantads.com.br", senha, TipoUsuario.GERENTE, "Godophredo", "64065268052");
        criarUsuario("ger3@bantads.com.br", senha, TipoUsuario.GERENTE, "Gyândula", "23862179060");
        criarUsuario("adm1@bantads.com.br", senha, TipoUsuario.ADMIN, "Adamântio", "40501740066");
    }

    private void criarUsuario(String email, String senhaEncoded, TipoUsuario tipo, String nome, String cpf) {
        User user = new User();
        user.setEmail(email);
        user.setSenha(senhaEncoded);
        user.setTipo(tipo);
        user.setNome(nome);
        user.setReferenciaId(cpf);
        userRepository.save(user);
    }
}
