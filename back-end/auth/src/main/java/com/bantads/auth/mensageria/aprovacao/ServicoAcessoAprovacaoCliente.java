package com.bantads.auth.mensageria.aprovacao;

import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class ServicoAcessoAprovacaoCliente {

    private static final String CARACTERES_SENHA = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final int TAMANHO_SENHA = 12;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServicoNotificacaoSenha servicoNotificacaoSenha;
    private final SecureRandom sorteador = new SecureRandom();

    public ServicoAcessoAprovacaoCliente(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        ServicoNotificacaoSenha servicoNotificacaoSenha
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.servicoNotificacaoSenha = servicoNotificacaoSenha;
    }

    public ResultadoAcessoAprovacao criarAcessoInicial(ComandoCriacaoAcessoAprovacao comando) {
        User usuarioCriado = null;
        try {
            validarComando(comando);
            Optional<User> usuarioExistente = buscarUsuarioExistente(comando);
            if (usuarioExistente.isPresent()) {
                validarUsuarioExistente(comando, usuarioExistente.get());
                return new ResultadoAcessoAprovacao(
                    comando.idSaga(),
                    comando.cpfCliente(),
                    comando.emailCliente(),
                    true,
                    false,
                    "Acesso inicial ja existente para o cliente"
                );
            }

            String senhaInicial = gerarSenha();
            User usuario = criarUsuario(comando, senhaInicial);

            usuarioCriado = userRepository.save(usuario);
            servicoNotificacaoSenha.enviarSenhaInicial(comando.emailCliente(), senhaInicial);

            return new ResultadoAcessoAprovacao(
                comando.idSaga(),
                comando.cpfCliente(),
                comando.emailCliente(),
                true,
                true,
                "Acesso inicial criado e senha aceita para envio"
            );
        } catch (Exception e) {
            String idSaga = comando != null ? comando.idSaga() : null;
            String cpfCliente = comando != null ? comando.cpfCliente() : null;
            String emailCliente = comando != null ? comando.emailCliente() : null;
            if (usuarioCriado != null) {
                removerAcesso(idSaga, usuarioCriado.getReferenciaId(), usuarioCriado.getEmail());
            }
            return new ResultadoAcessoAprovacao(
                idSaga,
                cpfCliente,
                emailCliente,
                false,
                false,
                e.getMessage()
            );
        }
    }

    public ResultadoAcessoAprovacao compensarAcesso(String idSaga, String cpfCliente, String emailCliente) {
        removerAcesso(idSaga, cpfCliente, emailCliente);
        return new ResultadoAcessoAprovacao(
            idSaga,
            cpfCliente,
            emailCliente,
            true,
            false,
            "Acesso compensado com sucesso"
        );
    }

    private void removerAcesso(String idSaga, String cpfCliente, String emailCliente) {
        if (!estaEmBranco(cpfCliente)) {
            userRepository.findByReferenciaId(cpfCliente)
                .filter(usuario -> emailClienteCoincide(usuario, emailCliente))
                .filter(usuario -> sagaAprovacaoCoincide(usuario, idSaga))
                .ifPresent(userRepository::delete);
            return;
        }
        if (!estaEmBranco(emailCliente)) {
            userRepository.findByEmail(emailCliente)
                .filter(usuario -> estaEmBranco(cpfCliente) || cpfClienteCoincide(usuario, cpfCliente))
                .filter(usuario -> sagaAprovacaoCoincide(usuario, idSaga))
                .ifPresent(userRepository::delete);
        }
    }

    private boolean emailClienteCoincide(User usuario, String emailCliente) {
        return !estaEmBranco(emailCliente) && emailCliente.equals(usuario.getEmail());
    }

    private boolean cpfClienteCoincide(User usuario, String cpfCliente) {
        return !estaEmBranco(cpfCliente) && cpfCliente.equals(usuario.getReferenciaId());
    }

    private void validarComando(ComandoCriacaoAcessoAprovacao comando) {
        if (comando == null || estaEmBranco(comando.idSaga()) || estaEmBranco(comando.cpfCliente())
            || estaEmBranco(comando.nomeCliente()) || estaEmBranco(comando.emailCliente())) {
            throw new IllegalArgumentException("Dados obrigatorios do acesso ausentes");
        }
    }

    private Optional<User> buscarUsuarioExistente(ComandoCriacaoAcessoAprovacao comando) {
        Optional<User> usuarioPorCpf = userRepository.findByReferenciaId(comando.cpfCliente());
        if (usuarioPorCpf.isPresent()) {
            return usuarioPorCpf;
        }
        return userRepository.findByEmail(comando.emailCliente());
    }

    private void validarUsuarioExistente(ComandoCriacaoAcessoAprovacao comando, User usuario) {
        boolean mesmoCpf = comando.cpfCliente().equals(usuario.getReferenciaId());
        boolean mesmoEmail = comando.emailCliente().equals(usuario.getEmail());
        if (!mesmoCpf || !mesmoEmail) {
            throw new IllegalStateException("E-mail ou CPF ja vinculado a outro acesso");
        }
    }

    private User criarUsuario(ComandoCriacaoAcessoAprovacao comando, String senhaInicial) {
        User usuario = new User();
        usuario.setNome(comando.nomeCliente());
        usuario.setEmail(comando.emailCliente());
        usuario.setSenha(passwordEncoder.encode(senhaInicial));
        usuario.setTipo(TipoUsuario.CLIENTE);
        usuario.setReferenciaId(comando.cpfCliente());
        usuario.setIdSagaAprovacao(comando.idSaga());
        return usuario;
    }

    private boolean sagaAprovacaoCoincide(User usuario, String idSaga) {
        return !estaEmBranco(idSaga) && idSaga.equals(usuario.getIdSagaAprovacao());
    }

    private String gerarSenha() {
        StringBuilder senha = new StringBuilder(TAMANHO_SENHA);
        for (int i = 0; i < TAMANHO_SENHA; i++) {
            senha.append(CARACTERES_SENHA.charAt(sorteador.nextInt(CARACTERES_SENHA.length())));
        }
        return senha.toString();
    }

    private boolean estaEmBranco(String valor) {
        return valor == null || valor.isBlank();
    }
}
