package io.synthesized.sample.bank.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.seed.url}")
    private String seedUrl;
    
    @Value("${spring.datasource.seed.username}")
    private String seedUsername;
    
    @Value("${spring.datasource.seed.password}")
    private String seedPassword;

    @Value("${spring.datasource.testing.url}")
    private String testingUrl;
    
    @Value("${spring.datasource.testing.username}")
    private String testingUsername;
    
    @Value("${spring.datasource.testing.password}")
    private String testingPassword;
    
    @Value("${spring.datasource.prod.url}")
    private String prodUrl;
    
    @Value("${spring.datasource.prod.username}")
    private String prodUsername;
    
    @Value("${spring.datasource.prod.password}")
    private String prodPassword;

    @Bean
    public DataSource seedDataSource() {
        return DataSourceBuilder.create()
                .url(seedUrl)
                .username(seedUsername)
                .password(seedPassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean
    public DataSource prodDataSource() {
        return DataSourceBuilder.create()
                .url(prodUrl)
                .username(prodUsername)
                .password(prodPassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean
    @Primary
    public DataSource testingDataSource() {
        return DataSourceBuilder.create()
                .url(testingUrl)
                .username(testingUsername)
                .password(testingPassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean    
    public JdbcTemplate seedJdbcTemplate(@Qualifier("seedDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    public JdbcTemplate prodJdbcTemplate(@Qualifier("prodDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    @Primary
    public JdbcTemplate testingJdbcTemplate(@Qualifier("testingDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
} 