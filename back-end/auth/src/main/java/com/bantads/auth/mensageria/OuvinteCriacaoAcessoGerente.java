package com.bantads.auth.mensageria;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;

@Component
public class OuvinteCriacaoAcessoGerente {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public OuvinteCriacaoAcessoGerente(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @RabbitListener(queues = "fila-criacao-acesso-gerente")
    public void criarAcessoNovoGerente(ComandoCriacaoAcessoGerente comando) {
        
        if (userRepository.findByEmail(comando.email()).isPresent()) {
            return; 
        }

        User novoUsuario = new User();
        novoUsuario.setReferenciaId(comando.cpf());
        novoUsuario.setNome(comando.nome());
        novoUsuario.setEmail(comando.email());
        novoUsuario.setTipo(comando.tipo().toUpperCase());
        
        novoUsuario.setSenha(passwordEncoder.encode(comando.senha()));

        userRepository.save(novoUsuario);
        
        System.out.println("✅ Acesso criado com sucesso para o novo gerente: " + comando.email());
    }
}