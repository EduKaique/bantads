package com.bantads.cliente.controller;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bantads.cliente.repository.ClienteRepository;
import com.bantads.cliente.repository.RepositorioSagaAprovacaoCliente;

@RestController
public class RebootController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private RepositorioSagaAprovacaoCliente sagaRepository;

    @Autowired
    private DataSource dataSource;

    @GetMapping("/reboot")
    public ResponseEntity<Void> reboot() {
        sagaRepository.deleteAll();
        clienteRepository.deleteAll();
        new ResourceDatabasePopulator(new ClassPathResource("data.sql")).execute(dataSource);
        return ResponseEntity.ok().build();
    }
}
