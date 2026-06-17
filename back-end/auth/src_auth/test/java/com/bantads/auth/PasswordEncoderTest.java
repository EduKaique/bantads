/*package com.bantads.auth.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PasswordEncoderTest {

    private Sha256SaltPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // Inicializa o encoder puramente em memória, sem precisar subir o Spring
        this.passwordEncoder = new Sha256SaltPasswordEncoder();
    }

    @Test
    @DisplayName("Deve encriptar uma senha e gerar uma string hash segura")
    void deveEncriptarSenhaComSucesso() {
        String senhaPura = "senhaSegura123";
        
        String senhaCodificada = passwordEncoder.encode(senhaPura);
        
        assertNotNull(senhaCodificada, "O hash gerado não deve ser nulo");
        assertNotEquals(senhaPura, "O hash gerado não pode ser igual à senha pura");
        assertFalse(senhaCodificada.isEmpty(), "O hash gerado não deve ser uma string vazia");
    }

    @Test
    @DisplayName("Deve validar com sucesso quando a senha pura corresponder ao hash")
    void deveCorresponderSenhaCorreta() {
        String senhaPura = "minhaSenhaMinhaVida";
        String hashGerado = passwordEncoder.encode(senhaPura);
        
        // Verifica se o método matches consegue descriptografar/validar a senha pura contra o hash
        boolean corresponde = passwordEncoder.matches(senhaPura, hashGerado);
        
        assertTrue(corresponde, "A senha pura deveria corresponder ao hash gerado a partir dela");
    }

    @Test
    @DisplayName("Deve rejeitar a validação se a senha pura for incorreta")
    void naoDeveCorresponderSenhaIncorreta() {
        String senhaPuraCorreta = "senhaCerta";
        String senhaPuraIncorreta = "senhaErrada";
        String hashGerado = passwordEncoder.encode(senhaPuraCorreta);
        
        boolean corresponde = passwordEncoder.matches(senhaPuraIncorreta, hashGerado);
        
        assertFalse(corresponde, "O encoder não deveria validar uma senha incorreta");
    }
} */