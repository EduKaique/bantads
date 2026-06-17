package com.bantads.conta.controller;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bantads.conta.repository.escrita.RepositorioContaEscrita;
import com.bantads.conta.repository.escrita.RepositorioMovimentacaoEscrita;
import com.bantads.conta.repository.leitura.RepositorioContaLeitura;
import com.bantads.conta.repository.leitura.RepositorioMovimentacaoLeitura;
import com.bantads.conta.service.ServicoContaLeitura;

@RestController
public class RebootController {

    @Autowired
    private RepositorioMovimentacaoLeitura repositorioMovimentacaoLeitura;

    @Autowired
    private RepositorioContaLeitura repositorioContaLeitura;

    @Autowired
    private RepositorioMovimentacaoEscrita repositorioMovimentacaoEscrita;

    @Autowired
    private RepositorioContaEscrita repositorioContaEscrita;

    @Autowired
    @Qualifier("fonteDadosEscrita")
    private DataSource fonteDadosEscrita;

    @Autowired
    private ServicoContaLeitura servicoContaLeitura;

    @GetMapping("/reboot")
    public ResponseEntity<Void> reboot() {
        repositorioMovimentacaoLeitura.deleteAll();
        repositorioContaLeitura.deleteAll();
        repositorioMovimentacaoEscrita.deleteAll();
        repositorioContaEscrita.deleteAll();
        new ResourceDatabasePopulator(new ClassPathResource("data.sql")).execute(fonteDadosEscrita);
        servicoContaLeitura.inicializarProjecaoSeNecessario();
        return ResponseEntity.ok().build();
    }
}
