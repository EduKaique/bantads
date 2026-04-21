package com.bantads.conta.service;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ClassPathResource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

@Configuration
public class InicializadorProjecaoConta {

    @Bean
    public ApplicationRunner inicializarProjecao(
        ServicoContaLeitura servicoContaLeitura,
        @Qualifier("fonteDadosEscrita") DataSource fonteDadosEscrita
    ) {
        return argumentos -> {
            ResourceDatabasePopulator populadorBanco = new ResourceDatabasePopulator(
                new ClassPathResource("data.sql")
            );
            populadorBanco.execute(fonteDadosEscrita);
            servicoContaLeitura.inicializarProjecaoSeNecessario();
        };
    }
}
