package com.bantads.conta.config;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.bantads.conta.repository.leitura",
    entityManagerFactoryRef = "fabricaEntidadeLeitura",
    transactionManagerRef = "gerenciadorTransacaoLeitura"
)
public class BancoLeituraConfiguracao {

    @Bean
    public DataSource fonteDadosLeitura(
        @Value("${aplicacao.datasource.leitura.url}") String url,
        @Value("${aplicacao.datasource.leitura.username}") String usuario,
        @Value("${aplicacao.datasource.leitura.password}") String senha,
        @Value("${aplicacao.datasource.leitura.driver-class-name}") String driver
    ) {
        DriverManagerDataSource fonteDados = new DriverManagerDataSource();
        fonteDados.setDriverClassName(driver);
        fonteDados.setUrl(url);
        fonteDados.setUsername(usuario);
        fonteDados.setPassword(senha);
        return fonteDados;
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean fabricaEntidadeLeitura(
        @Qualifier("fonteDadosLeitura") DataSource fonteDadosLeitura
    ) {
        LocalContainerEntityManagerFactoryBean fabrica = new LocalContainerEntityManagerFactoryBean();
        fabrica.setDataSource(fonteDadosLeitura);
        fabrica.setPackagesToScan("com.bantads.conta.entity.leitura");
        fabrica.setPersistenceUnitName("bancoLeitura");
        fabrica.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        fabrica.setJpaPropertyMap(propriedadesJpa());
        return fabrica;
    }

    @Bean
    public PlatformTransactionManager gerenciadorTransacaoLeitura(
        @Qualifier("fabricaEntidadeLeitura") EntityManagerFactory fabricaEntidadeLeitura
    ) {
        return new JpaTransactionManager(fabricaEntidadeLeitura);
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
