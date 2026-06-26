package io.synthesized.sample.insurance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import io.synthesized.sample.insurance.model.DatabaseType;
import java.util.List;
import java.util.Map;

@Service
public class CrossSystemService {

    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public CrossSystemService(
            @Qualifier("seedJdbcTemplate") JdbcTemplate seedJdbcTemplate,
            @Qualifier("testingJdbcTemplate") JdbcTemplate testingJdbcTemplate,
            @Qualifier("prodJdbcTemplate") JdbcTemplate prodJdbcTemplate) {
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

    /**
     * Get healthcare information for a specific policy
     * This queries the healthcare database to find patients linked to this insurance policy
     */
    public List<Map<String, Object>> getHealthcareInfoForPolicy(String database, Integer policyId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());

        // Determine which healthcare database to query based on insurance database
        String healthcareDbName = switch (databaseType) {
            case SEED -> "healthcare_seed";
            case TESTING -> "healthcare_testing";
            case PROD -> "healthcare_prod";
        };

        String sql =
            "SELECT " +
                "p.patient_id, " +
                "p.first_name, " +
                "p.last_name, " +
                "p.email, " +
                "p.medical_record_number, " +
                "p.insurance_policy_id, " +
                "COUNT(DISTINCT a.appointment_id) as appointment_count, " +
                "COUNT(DISTINCT pr.prescription_id) as prescription_count " +
            "FROM " + healthcareDbName + ".patients p " +
            "LEFT JOIN " + healthcareDbName + ".appointments a ON p.patient_id = a.patient_id " +
            "LEFT JOIN " + healthcareDbName + ".prescriptions pr ON a.appointment_id = pr.appointment_id " +
            "WHERE p.insurance_policy_id = ? " +
            "GROUP BY p.patient_id, p.first_name, p.last_name, p.email, p.medical_record_number, p.insurance_policy_id";

        try {
            return getJdbcTemplate(databaseType).queryForList(sql, policyId);
        } catch (Exception e) {
            // Return empty list if healthcare database is not accessible or table doesn't exist
            return List.of();
        }
    }

    /**
     * Get all policies with their linked healthcare patient count
     */
    public List<Map<String, Object>> getPoliciesWithHealthcareLinks(String database) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());

        String healthcareDbName = switch (databaseType) {
            case SEED -> "healthcare_seed";
            case TESTING -> "healthcare_testing";
            case PROD -> "healthcare_prod";
        };

        String sql =
            "SELECT " +
                "pol.policy_id, " +
                "pol.policy_number, " +
                "pol.policy_type, " +
                "COUNT(DISTINCT p.patient_id) as linked_patient_count " +
            "FROM insurance.policies pol " +
            "LEFT JOIN " + healthcareDbName + ".patients p ON pol.policy_id = p.insurance_policy_id " +
            "GROUP BY pol.policy_id, pol.policy_number, pol.policy_type " +
            "HAVING COUNT(DISTINCT p.patient_id) > 0 " +
            "ORDER BY pol.policy_id";

        try {
            return getJdbcTemplate(databaseType).queryForList(sql);
        } catch (Exception e) {
            return List.of();
        }
    }
}
