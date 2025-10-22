package io.synthesized.sample.bank.repository;

import io.synthesized.sample.bank.model.DatabaseType;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class StatisticsRepository {
    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    public StatisticsRepository(
        @Qualifier("seedJdbcTemplate") JdbcTemplate seedJdbcTemplate,
        @Qualifier("testingJdbcTemplate") JdbcTemplate testingJdbcTemplate,
        @Qualifier("prodJdbcTemplate") JdbcTemplate prodJdbcTemplate
    ) {
        this.seedJdbcTemplate = seedJdbcTemplate;
        this.testingJdbcTemplate = testingJdbcTemplate;
        this.prodJdbcTemplate = prodJdbcTemplate;
    }

    private JdbcTemplate getJdbcTemplate(DatabaseType databaseType) {
        return switch (databaseType) {
            case SEED -> seedJdbcTemplate;
            case TESTING -> testingJdbcTemplate;
            case PROD -> prodJdbcTemplate;
        };
    }

    public long getTransactionCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM bank.transactions",
            Long.class
        );
    }

    public long getCustomerCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM bank.customers",
            Long.class
        );
    }

    public long getAccountCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM bank.accounts",
            Long.class
        );
    }

    public long getBranchCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM bank.branches",
            Long.class
        );
    }
} 