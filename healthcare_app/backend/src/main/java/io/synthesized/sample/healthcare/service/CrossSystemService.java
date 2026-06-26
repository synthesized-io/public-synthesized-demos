package io.synthesized.sample.healthcare.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import io.synthesized.sample.healthcare.model.DatabaseType;
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
     * Get insurance policy information for a specific patient
     * This queries the insurance database to find the policy linked to this patient
     */
    public Map<String, Object> getInsuranceInfoForPatient(String database, Integer patientId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());

        // First, get the patient's insurance_policy_id
        String patientSql = "SELECT insurance_policy_id FROM healthcare.patients WHERE patient_id = ?";
        Integer insurancePolicyId;

        try {
            insurancePolicyId = getJdbcTemplate(databaseType).queryForObject(
                patientSql, Integer.class, patientId);

            if (insurancePolicyId == null) {
                return Map.of("message", "No insurance policy linked to this patient");
            }
        } catch (Exception e) {
            return Map.of("message", "Patient not found or no insurance policy linked");
        }

        // Determine which insurance database to query based on healthcare database
        String insuranceDbName = switch (databaseType) {
            case SEED -> "insurance_seed";
            case TESTING -> "insurance_testing";
            case PROD -> "insurance_prod";
        };

        String sql =
            "SELECT " +
                "p.policy_id, " +
                "p.policy_number, " +
                "p.policy_type, " +
                "p.status, " +
                "p.coverage_amount, " +
                "p.premium_amount, " +
                "p.payment_frequency, " +
                "p.coverage_level, " +
                "p.start_date, " +
                "p.end_date, " +
                "ph.first_name as policyholder_first_name, " +
                "ph.last_name as policyholder_last_name, " +
                "ph.email as policyholder_email " +
            "FROM " + insuranceDbName + ".policies p " +
            "JOIN " + insuranceDbName + ".policyholders ph ON p.policyholder_id = ph.policyholder_id " +
            "WHERE p.policy_id = ?";

        try {
            return getJdbcTemplate(databaseType).queryForMap(sql, insurancePolicyId);
        } catch (Exception e) {
            return Map.of("message", "Insurance policy not found in insurance system",
                         "insurance_policy_id", insurancePolicyId);
        }
    }

    /**
     * Get all patients with their linked insurance policy information
     */
    public List<Map<String, Object>> getPatientsWithInsuranceLinks(String database) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());

        String insuranceDbName = switch (databaseType) {
            case SEED -> "insurance_seed";
            case TESTING -> "insurance_testing";
            case PROD -> "insurance_prod";
        };

        String sql =
            "SELECT " +
                "p.patient_id, " +
                "p.first_name, " +
                "p.last_name, " +
                "p.medical_record_number, " +
                "p.insurance_policy_id, " +
                "pol.policy_number, " +
                "pol.policy_type, " +
                "pol.status as policy_status, " +
                "pol.coverage_amount " +
            "FROM healthcare.patients p " +
            "LEFT JOIN " + insuranceDbName + ".policies pol ON p.insurance_policy_id = pol.policy_id " +
            "WHERE p.insurance_policy_id IS NOT NULL " +
            "ORDER BY p.patient_id";

        try {
            return getJdbcTemplate(databaseType).queryForList(sql);
        } catch (Exception e) {
            return List.of();
        }
    }
}
