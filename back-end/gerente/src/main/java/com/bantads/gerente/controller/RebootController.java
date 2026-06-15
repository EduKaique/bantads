package com.bantads.gerente.controller;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bantads.gerente.repository.GerenteRepository;

@RestController
public class RebootController {

    @Autowired
    private GerenteRepository gerenteRepository;

    @Autowired
    private DataSource dataSource;

    @GetMapping("/reboot")
    public ResponseEntity<Void> reboot() {
        gerenteRepository.deleteAll();
        new ResourceDatabasePopulator(new ClassPathResource("data.sql")).execute(dataSource);
        return ResponseEntity.ok().build();
    }
}
