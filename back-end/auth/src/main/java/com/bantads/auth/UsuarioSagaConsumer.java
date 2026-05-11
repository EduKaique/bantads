package com.bantads.auth;

import com.bantads.auth.config.RabbitMqConfiguracao;
import com.bantads.auth.dto.AutocadastroInfoDTO;
import com.bantads.auth.dto.ClienteAtualizadoEvent;
import com.bantads.auth.dto.GerenteAtualizadoEvent;
import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UsuarioSagaConsumer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_AUTOCADASTRO_AUTH)
    public void criarUsuarioSaga(AutocadastroInfoDTO dto) {
        try {
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

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_AUTOCADASTRO_AUTH_ROLLBACK)
    public void cancelarUsuarioSaga(AutocadastroInfoDTO dto) {
        userRepository.findByEmail(dto.getEmail())
            .ifPresent(user -> userRepository.delete(user));
        System.out.println("Rollback realizado: Usuario removido do MS Auth.");
    }

    @RabbitListener(bindings = @QueueBinding(
        value = @Queue(value = "auth.cliente.atualizado.fila", durable = "true"),
        exchange = @Exchange(value = "cliente.exchange", type = "direct"),
        key = "cliente.perfil.alterado"
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

    @RabbitListener(bindings = @QueueBinding(
        value = @Queue(value = "auth.gerente.atualizado.fila", durable = "true"),
        exchange = @Exchange(value = "gerente.exchange", type = "direct"),
        key = "gerente.perfil.alterado"
    ))
    public void atualizarGerenteSaga(GerenteAtualizadoEvent evento) {
        try {
            userRepository.findByReferenciaId(evento.cpf()).ifPresent(user -> {
                if (evento.nome() != null && !evento.nome().isBlank()) {
                    user.setNome(evento.nome());
                }
                if (evento.email() != null && !evento.email().isBlank()) {
                    user.setEmail(evento.email());
                }
                if (evento.senha() != null && !evento.senha().isBlank()) {
                    user.setSenha(passwordEncoder.encode(evento.senha()));
                }

                userRepository.save(user);
                System.out.println("MS-Auth: Dados do gerente atualizados via Saga para o CPF: " + evento.cpf());
            });
        } catch (Exception e) {
            System.err.println("Erro Saga (MS-Auth): Nao foi possivel atualizar gerente. " + e.getMessage());
        }
    }
}
