package io.synthesized.sample.insurance.repository;

import io.synthesized.sample.insurance.model.Policy;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.model.PolicyResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.ArrayList;

@Repository
public class PolicyRepository {
    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public PolicyRepository(
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

    private final RowMapper<Policy> policyRowMapper = (rs, rowNum) -> {
        Policy policy = new Policy();
        policy.setPolicyId(rs.getLong("policy_id"));
        policy.setPolicyholderId(rs.getLong("policyholder_id"));
        policy.setPolicyholderFirstName(rs.getString("first_name"));
        policy.setPolicyholderLastName(rs.getString("last_name"));
        policy.setPolicyNumber(rs.getString("policy_number"));
        policy.setPolicyType(rs.getString("policy_type"));
        policy.setStatus(rs.getString("status"));
        policy.setCoverageAmount(rs.getBigDecimal("coverage_amount"));
        policy.setPremiumAmount(rs.getBigDecimal("premium_amount"));
        policy.setPaymentFrequency(rs.getString("payment_frequency"));
        policy.setCoverageLevel(rs.getString("coverage_level"));
        policy.setStartDate(rs.getDate("start_date").toLocalDate());
        policy.setEndDate(rs.getDate("end_date").toLocalDate());
        policy.setClaimCount(rs.getInt("claim_count"));
        return policy;
    };

    public List<Policy> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            """
            SELECT policy_id, policyholder_id, policy_number, policy_type, status, coverage_amount, premium_amount, payment_frequency, coverage_level, start_date, end_date
            FROM insurance.policies
            ORDER BY policy_id ASC
            """,
            policyRowMapper
        );
    }

    public PolicyResponse findByFilters(
            DatabaseType databaseType,
            int page,
            int size,
            String sortBy,
            String sortOrder,
            String policyType,
            String status,
            String policyId,
            String search) {

        StringBuilder countQuery = new StringBuilder(
            """
            SELECT COUNT(*)
            FROM insurance.policies
            WHERE 1=1
            """
        );

        StringBuilder dataQuery = new StringBuilder(
            """
            SELECT p.policy_id, p.policyholder_id, ph.first_name, ph.last_name, p.policy_number, p.policy_type, p.status, p.coverage_amount, p.premium_amount, p.payment_frequency, p.coverage_level, p.start_date, p.end_date,
                   COALESCE((SELECT COUNT(*) FROM insurance.claims c WHERE c.policy_id = p.policy_id), 0) as claim_count
            FROM insurance.policies p
            LEFT JOIN insurance.policyholders ph ON p.policyholder_id = ph.policyholder_id
            WHERE 1=1
            """
        );

        List<Object> params = new ArrayList<>();

        if (policyType != null && !policyType.isEmpty()) {
            countQuery.append(" AND policy_type = ?::insurance.policy_type_enum");
            dataQuery.append(" AND p.policy_type = ?::insurance.policy_type_enum");
            params.add(policyType);
        }

        if (status != null && !status.isEmpty()) {
            countQuery.append(" AND status = ?::insurance.policy_status_enum");
            dataQuery.append(" AND p.status = ?::insurance.policy_status_enum");
            params.add(status);
        }

        if (policyId != null && !policyId.isEmpty()) {
            countQuery.append(" AND policy_id = ?");
            dataQuery.append(" AND p.policy_id = ?");
            params.add(Long.parseLong(policyId));
        } else if (search != null && !search.isEmpty()) {
            // Try to parse as policy ID first
            try {
                Long searchPolicyId = Long.parseLong(search);
                countQuery.append(" AND policy_id = ?");
                dataQuery.append(" AND p.policy_id = ?");
                params.add(searchPolicyId);
            } catch (NumberFormatException e) {
                // If not a number, search in other fields
                String searchPattern = "%" + search.toLowerCase() + "%";
                countQuery.append(" AND (LOWER(CAST(policy_id AS TEXT)) LIKE ? OR LOWER(policy_number) LIKE ? OR LOWER(policy_type::text) LIKE ? OR LOWER(status::text) LIKE ?)");
                dataQuery.append(" AND (LOWER(CAST(p.policy_id AS TEXT)) LIKE ? OR LOWER(p.policy_number) LIKE ? OR LOWER(p.policy_type::text) LIKE ? OR LOWER(p.status::text) LIKE ?)");
                // Add search pattern for each field
                for (int i = 0; i < 4; i++) {
                    params.add(searchPattern);
                }
            }
        }

        // Add sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            dataQuery.append(" ORDER BY p.").append(sortBy).append(" ").append(sortOrder);
        } else {
            dataQuery.append(" ORDER BY p.policy_id ").append(sortOrder);
        }

        // Add pagination
        dataQuery.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        // Get total count
        int totalCount;
        if (params.isEmpty()) {
            totalCount = getJdbcTemplate(databaseType).queryForObject(countQuery.toString(), Integer.class);
        } else {
            totalCount = getJdbcTemplate(databaseType).queryForObject(
                countQuery.toString(),
                Integer.class,
                params.subList(0, params.size() - 2).toArray()
            );
        }

        // Get paginated data
        List<Policy> policies = getJdbcTemplate(databaseType).query(
            dataQuery.toString(),
            policyRowMapper,
            params.toArray()
        );

        return new PolicyResponse(policies, totalCount);
    }

    public Policy create(Policy policy, DatabaseType databaseType) {
        // Validate required fields
        if (policy.getPolicyholderId() == null) {
            throw new IllegalArgumentException("Policyholder ID is required");
        }
        if (policy.getPolicyType() == null || policy.getPolicyType().trim().isEmpty()) {
            throw new IllegalArgumentException("Policy Type is required");
        }
        if (policy.getStatus() == null || policy.getStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        // Get the next available policy ID
        Long nextId = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT COALESCE(MAX(policy_id), 0) + 1
            FROM insurance.policies
            """,
            Long.class
        );

        // Insert with the generated ID
        getJdbcTemplate(databaseType).update(
            """
            INSERT INTO insurance.policies (
                policyholder_id, policy_number, policy_type, status, coverage_amount, premium_amount, payment_frequency, coverage_level, start_date, end_date
            ) VALUES (?, ?, ?::insurance.policy_type_enum, ?::insurance.policy_status_enum, ?, ?, ?::insurance.payment_frequency_enum, ?::insurance.coverage_level_enum, ?, ?)
            """,
            policy.getPolicyholderId(),
            policy.getPolicyNumber(),
            policy.getPolicyType(),
            policy.getStatus(),
            policy.getCoverageAmount(),
            policy.getPremiumAmount(),
            policy.getPaymentFrequency(),
            policy.getCoverageLevel(),
            policy.getStartDate(),
            policy.getEndDate()
        );

        policy.setPolicyId(nextId);
        return policy;
    }

    public Policy updateStatus(Long policyId, String status, DatabaseType databaseType) {
        // Validate policy exists
        Policy existingPolicy = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT policy_id, policyholder_id, policy_number, policy_type, status, coverage_amount, premium_amount, payment_frequency, coverage_level, start_date, end_date
            FROM insurance.policies
            WHERE policy_id = ?
            """,
            policyRowMapper,
            policyId
        );

        if (existingPolicy == null) {
            throw new IllegalArgumentException("Policy not found with ID: " + policyId);
        }

        // Update status
        getJdbcTemplate(databaseType).update(
            """
            UPDATE insurance.policies
            SET status = ?::insurance.policy_status_enum
            WHERE policy_id = ?
            """,
            status, policyId
        );

        // Return updated policy
        return getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT policy_id, policyholder_id, policy_number, policy_type, status, coverage_amount, premium_amount, payment_frequency, coverage_level, start_date, end_date
            FROM insurance.policies
            WHERE policy_id = ?
            """,
            policyRowMapper,
            policyId
        );
    }

    public java.util.Map<String, Integer> countPoliciesByStatus(DatabaseType databaseType) {
        String sql = "SELECT status, COUNT(*) as count FROM insurance.policies GROUP BY status";
        return getJdbcTemplate(databaseType).query(sql, rs -> {
            java.util.Map<String, Integer> result = new java.util.HashMap<>();
            while (rs.next()) {
                result.put(rs.getString("status"), rs.getInt("count"));
            }
            return result;
        });
    }

    public void deleteById(Long policyId, DatabaseType databaseType) {
        // Delete related claims
        getJdbcTemplate(databaseType).update(
            "DELETE FROM insurance.claims WHERE policy_id = ?",
            policyId
        );
        // Then delete the policy
        getJdbcTemplate(databaseType).update(
            "DELETE FROM insurance.policies WHERE policy_id = ?",
            policyId
        );
    }
}
