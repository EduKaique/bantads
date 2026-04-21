package com.bantads.conta.config;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.bantads.conta.repository.escrita",
    entityManagerFactoryRef = "fabricaEntidadeEscrita",
    transactionManagerRef = "gerenciadorTransacaoEscrita"
)
public class BancoEscritaConfiguracao {

    @Bean
    @Primary
    public DataSource fonteDadosEscrita(
        @Value("${aplicacao.datasource.escrita.url}") String url,
        @Value("${aplicacao.datasource.escrita.username}") String usuario,
        @Value("${aplicacao.datasource.escrita.password}") String senha,
        @Value("${aplicacao.datasource.escrita.driver-class-name}") String driver
    ) {
        DriverManagerDataSource fonteDados = new DriverManagerDataSource();
        fonteDados.setDriverClassName(driver);
        fonteDados.setUrl(url);
        fonteDados.setUsername(usuario);
        fonteDados.setPassword(senha);
        return fonteDados;
    }

    @Bean
    @Primary
    public LocalContainerEntityManagerFactoryBean fabricaEntidadeEscrita(
        @Qualifier("fonteDadosEscrita") DataSource fonteDadosEscrita
    ) {
        LocalContainerEntityManagerFactoryBean fabrica = new LocalContainerEntityManagerFactoryBean();
        fabrica.setDataSource(fonteDadosEscrita);
        fabrica.setPackagesToScan("com.bantads.conta.entity.escrita");
        fabrica.setPersistenceUnitName("bancoEscrita");
        fabrica.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        fabrica.setJpaPropertyMap(propriedadesJpa());
        return fabrica;
    }

    @Bean
    @Primary
    public PlatformTransactionManager gerenciadorTransacaoEscrita(
        @Qualifier("fabricaEntidadeEscrita") EntityManagerFactory fabricaEntidadeEscrita
    ) {
        return new JpaTransactionManager(fabricaEntidadeEscrita);
    }

    private Map<String, Object> propriedadesJpa() {
        Map<String, Object> propriedades = new HashMap<>();
        propriedades.put("hibernate.hbm2ddl.auto", "update");
        propriedades.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        propriedades.put("hibernate.show_sql", "true");
        propriedades.put("hibernate.format_sql", "true");
        return propriedades;
    }
}
