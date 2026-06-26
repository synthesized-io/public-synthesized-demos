package io.synthesized.sample.insurance.repository;

import io.synthesized.sample.insurance.model.DatabaseType;
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

    public long getPolicyholderCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM insurance.policyholders",
            Long.class
        );
    }

    public long getPolicyCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM insurance.policies",
            Long.class
        );
    }

    public long getClaimCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM insurance.claims",
            Long.class
        );
    }

    public long getAgentCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM insurance.agents",
            Long.class
        );
    }
}
