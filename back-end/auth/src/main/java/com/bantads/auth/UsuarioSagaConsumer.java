package com.bantads.auth;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.bantads.auth.dto.InformacaoAutocadastroDTO;
import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.repository.UserRepository;
import com.bantads.auth.model.User;

@Component
public class UsuarioSagaConsumer {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = "saga.autocadastro.auth")
    public void criarUsuarioSaga(InformacaoAutocadastroDTO dto) {
        try{
            User novoUsuario = new User();
            novoUsuario.setNome(dto.getNome());
            novoUsuario.setEmail(dto.getEmail());
            novoUsuario.setSenha(passwordEncoder.encode(dto.getSenha()));
            novoUsuario.setTipo(TipoUsuario.CLIENTE);
            novoUsuario.setReferenciaId(dto.getCpf());

            userRepository.save(novoUsuario);
            rabbitTemplate.convertAndSend("saga.autocadastro.exchange", "saga.autocadastro.auth.ok", dto);

        } catch (Exception e) {
            rabbitTemplate.convertAndSend("saga.autocadastro.exchange", "saga.autocadastro.erro", dto);
        }
    }

    @RabbitListener(queues = "saga.autocadastro.auth.rollback")
    public void cancelarUsuarioSaga(InformacaoAutocadastroDTO dto) {
        userRepository.findByEmail(dto.getEmail())
            .ifPresent(user -> userRepository.delete(user));
        System.out.println("Rollback realizado: Usuário removido do MS Auth.");
    
    }

}
