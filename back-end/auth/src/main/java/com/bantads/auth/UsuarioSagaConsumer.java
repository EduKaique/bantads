package com.bantads.auth;

import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.bantads.auth.dto.AutocadastroInfoDTO;
import com.bantads.auth.dto.ClienteAtualizadoEvent; 
import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.bantads.auth.dto.AutocadastroInfoDTO;

@Component
public class UsuarioSagaConsumer {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
   
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @RabbitListener(queuesToDeclare = @Queue("saga.autocadastro.auth"))
    public void CriarUsuarioSaga(AutocadastroInfoDTO dto) {
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

    @RabbitListener(queuesToDeclare = @Queue("saga.autocadastro.auth.rollback"))
    public void cancelarUsuarioSaga(AutocadastroInfoDTO dto) {
        userRepository.findByEmail(dto.getEmail())
            .ifPresent(user -> userRepository.delete(user));
        System.out.println("Rollback realizado: Usuário removido do MS Auth.");
    }

    @RabbitListener(bindings = @QueueBinding(
        value = @Queue(value = "auth.cliente.atualizado.fila", durable = "true"),
        exchange = @Exchange(value = "cliente.exchange", type = "direct"), // Alterado para 'direct'
        key = "cliente.perfil.alterado" // Alterado para a chave exata do ms-cliente
    ))
    public void atualizarUsuarioSaga(ClienteAtualizadoEvent evento) {
        try {
            userRepository.findByReferenciaId(evento.cpf()).ifPresent(user -> {
                if (evento.nome() != null) user.setNome(evento.nome());
                if (evento.email() != null) user.setEmail(evento.email());
                
                userRepository.save(user);
                System.out.println("MS-Auth: E-mail e Nome atualizados via Saga para o CPF: " + evento.cpf());
            });
        } catch (Exception e) {  
            System.err.println("Erro Saga (MS-Auth): Não foi possível atualizar perfil. " + e.getMessage());
        }
    }
}