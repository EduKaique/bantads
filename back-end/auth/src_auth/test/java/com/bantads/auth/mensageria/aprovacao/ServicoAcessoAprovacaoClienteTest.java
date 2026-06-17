package com.bantads.auth.mensageria.aprovacao;

import com.bantads.auth.model.TipoUsuario;
import com.bantads.auth.model.User;
import com.bantads.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServicoAcessoAprovacaoClienteTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ServicoNotificacaoSenha servicoNotificacaoSenha;

    @InjectMocks
    private ServicoAcessoAprovacaoCliente servicoAcesso;

    @Captor
    private ArgumentCaptor<User> usuarioCaptor;

    @Test
    void deveCriarAcessoInicialComSenhaCriptografada() {
        ComandoCriacaoAcessoAprovacao comando = new ComandoCriacaoAcessoAprovacao(
            "saga-1",
            "12345678901",
            "Cliente Teste",
            "cliente@bantads.com"
        );

        when(userRepository.findByReferenciaId("12345678901")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("cliente@bantads.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("senha-criptografada");

        ResultadoAcessoAprovacao resultado = servicoAcesso.criarAcessoInicial(comando);

        verify(userRepository).save(usuarioCaptor.capture());
        verify(servicoNotificacaoSenha).enviarSenhaInicial(eq("cliente@bantads.com"), anyString());

        User usuario = usuarioCaptor.getValue();
        assertTrue(resultado.sucesso());
        assertTrue(resultado.acessoCriado());
        assertEquals("senha-criptografada", usuario.getSenha());
        assertEquals(TipoUsuario.CLIENTE, usuario.getTipo());
        assertEquals("12345678901", usuario.getReferenciaId());
        assertEquals("saga-1", usuario.getIdSagaAprovacao());
    }

    @Test
    void deveResponderSucessoSemRecriarAcessoExistente() {
        ComandoCriacaoAcessoAprovacao comando = new ComandoCriacaoAcessoAprovacao(
            "saga-2",
            "12345678901",
            "Cliente Teste",
            "cliente@bantads.com"
        );
        User usuario = new User();
        usuario.setReferenciaId("12345678901");
        usuario.setEmail("cliente@bantads.com");
        usuario.setTipo(TipoUsuario.CLIENTE);

        when(userRepository.findByReferenciaId("12345678901")).thenReturn(Optional.of(usuario));

        ResultadoAcessoAprovacao resultado = servicoAcesso.criarAcessoInicial(comando);

        assertTrue(resultado.sucesso());
        assertFalse(resultado.acessoCriado());
        verify(userRepository, never()).save(any(User.class));
        verify(servicoNotificacaoSenha, never()).enviarSenhaInicial(anyString(), anyString());
    }

    @Test
    void naoDeveRemoverAcessoExistenteQuandoDadosPertencemAOutroCliente() {
        ComandoCriacaoAcessoAprovacao comando = new ComandoCriacaoAcessoAprovacao(
            "saga-3",
            "12345678901",
            "Cliente Teste",
            "cliente@bantads.com"
        );
        User usuario = new User();
        usuario.setReferenciaId("99999999999");
        usuario.setEmail("cliente@bantads.com");
        usuario.setTipo(TipoUsuario.CLIENTE);

        when(userRepository.findByReferenciaId("12345678901")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("cliente@bantads.com")).thenReturn(Optional.of(usuario));

        ResultadoAcessoAprovacao resultado = servicoAcesso.criarAcessoInicial(comando);

        assertFalse(resultado.sucesso());
        verify(userRepository, never()).delete(any(User.class));
        verify(userRepository, never()).save(any(User.class));
        verify(servicoNotificacaoSenha, never()).enviarSenhaInicial(anyString(), anyString());
    }

    @Test
    void naoDeveCompensarAcessoQuandoCpfEEmailNaoPertencemAoMesmoUsuario() {
        User usuario = new User();
        usuario.setReferenciaId("12345678901");
        usuario.setEmail("outro@bantads.com");
        usuario.setTipo(TipoUsuario.CLIENTE);
        usuario.setIdSagaAprovacao("saga-4");

        when(userRepository.findByReferenciaId("12345678901")).thenReturn(Optional.of(usuario));

        ResultadoAcessoAprovacao resultado = servicoAcesso.compensarAcesso(
            "saga-4",
            "12345678901",
            "cliente@bantads.com"
        );

        assertTrue(resultado.sucesso());
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void deveCompensarAcessoQuandoCpfEEmailPertencemAoMesmoUsuario() {
        User usuario = new User();
        usuario.setReferenciaId("12345678901");
        usuario.setEmail("cliente@bantads.com");
        usuario.setTipo(TipoUsuario.CLIENTE);
        usuario.setIdSagaAprovacao("saga-5");

        when(userRepository.findByReferenciaId("12345678901")).thenReturn(Optional.of(usuario));

        ResultadoAcessoAprovacao resultado = servicoAcesso.compensarAcesso(
            "saga-5",
            "12345678901",
            "cliente@bantads.com"
        );

        assertTrue(resultado.sucesso());
        verify(userRepository).delete(usuario);
    }

    @Test
    void naoDeveCompensarAcessoCriadoPorOutraSaga() {
        User usuario = new User();
        usuario.setReferenciaId("12345678901");
        usuario.setEmail("cliente@bantads.com");
        usuario.setTipo(TipoUsuario.CLIENTE);
        usuario.setIdSagaAprovacao("outra-saga");

        when(userRepository.findByReferenciaId("12345678901")).thenReturn(Optional.of(usuario));

        ResultadoAcessoAprovacao resultado = servicoAcesso.compensarAcesso(
            "saga-6",
            "12345678901",
            "cliente@bantads.com"
        );

        assertTrue(resultado.sucesso());
        verify(userRepository, never()).delete(any(User.class));
    }
}
