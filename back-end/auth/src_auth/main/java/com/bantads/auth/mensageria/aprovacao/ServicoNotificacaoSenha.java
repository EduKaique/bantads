package com.bantads.auth.mensageria.aprovacao;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ServicoNotificacaoSenha {

    private final JavaMailSender mailSender;
    private final String remetente;
    private final boolean envioHabilitado;

    public ServicoNotificacaoSenha(
        JavaMailSender mailSender,
        @Value("${bantads.email.remetente}") String remetente,
        @Value("${bantads.email.envio-habilitado:false}") boolean envioHabilitado
    ) {
        this.mailSender = mailSender;
        this.remetente = remetente;
        this.envioHabilitado = envioHabilitado;
    }

    public void enviarSenhaInicial(String emailCliente, String senhaInicial) {
        if (!envioHabilitado) {
            return;
        }

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setFrom(remetente);
        mensagem.setTo(emailCliente);
        mensagem.setSubject("Acesso inicial BANTADS");
        mensagem.setText("Seu cadastro foi aprovado. Senha inicial: " + senhaInicial);
        mailSender.send(mensagem);
    }
}
