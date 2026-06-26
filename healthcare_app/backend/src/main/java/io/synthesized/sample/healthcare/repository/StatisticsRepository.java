package io.synthesized.sample.healthcare.repository;

import io.synthesized.sample.healthcare.model.DatabaseType;
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

    public long getPatientCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM healthcare.patients",
            Long.class
        );
    }

    public long getAppointmentCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM healthcare.appointments",
            Long.class
        );
    }

    public long getPrescriptionCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM healthcare.prescriptions",
            Long.class
        );
    }

    public long getProviderCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM healthcare.providers",
            Long.class
        );
    }

    public long getUpcomingAppointmentCount(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).queryForObject(
            "SELECT COUNT(*) FROM healthcare.appointments WHERE appointment_status = 'Scheduled' AND appointment_date >= CURRENT_TIMESTAMP",
            Long.class
        );
    }
}
