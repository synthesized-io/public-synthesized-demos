package io.synthesized.sample.insurance.repository;

import io.synthesized.sample.insurance.model.Claim;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.model.ClaimResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.ArrayList;

@Repository
public class ClaimRepository {
    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public ClaimRepository(
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

    private final RowMapper<Claim> claimRowMapper = (rs, rowNum) -> {
        Claim claim = new Claim();
        claim.setClaimId(rs.getLong("claim_id"));
        claim.setPolicyId(rs.getLong("policy_id"));
        claim.setClaimNumber(rs.getString("claim_number"));
        claim.setClaimType(rs.getString("claim_type"));
        claim.setClaimStatus(rs.getString("claim_status"));
        claim.setFiledDate(rs.getDate("filed_date").toLocalDate());
        claim.setIncidentDate(rs.getDate("incident_date").toLocalDate());
        claim.setClaimAmount(rs.getBigDecimal("claim_amount"));
        claim.setSettlementAmount(rs.getBigDecimal("settlement_amount"));
        claim.setDescription(rs.getString("description"));
        return claim;
    };

    public List<Claim> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            """
            SELECT claim_id, policy_id, claim_number, claim_type, claim_status, filed_date, incident_date, claim_amount, settlement_amount, description
            FROM insurance.claims
            ORDER BY claim_id
            """,
            claimRowMapper
        );
    }

    public ClaimResponse findByFilters(
            DatabaseType databaseType,
            String claimType,
            String claimStatus,
            String claimId,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size,
            String policyIds) {

        StringBuilder countQuery = new StringBuilder(
            """
            SELECT COUNT(*)
            FROM insurance.claims
            WHERE 1=1
            """
        );

        StringBuilder dataQuery = new StringBuilder(
            """
            SELECT claim_id, policy_id, claim_number, claim_type, claim_status, filed_date, incident_date, claim_amount, settlement_amount, description
            FROM insurance.claims
            WHERE 1=1
            """
        );

        List<Object> params = new ArrayList<>();

        if (claimType != null && !claimType.isEmpty()) {
            countQuery.append(" AND claim_type = ?::insurance.claim_type_enum");
            dataQuery.append(" AND claim_type = ?::insurance.claim_type_enum");
            params.add(claimType);
        }

        if (claimStatus != null && !claimStatus.isEmpty()) {
            countQuery.append(" AND claim_status = ?::insurance.claim_status_enum");
            dataQuery.append(" AND claim_status = ?::insurance.claim_status_enum");
            params.add(claimStatus);
        }

        if (claimId != null && !claimId.isEmpty()) {
            countQuery.append(" AND claim_id = ?");
            dataQuery.append(" AND claim_id = ?");
            params.add(Long.parseLong(claimId));
        }

        if (policyIds != null && !policyIds.isEmpty()) {
            String[] ids = policyIds.split(",");
            if (ids.length > 0) {
                countQuery.append(" AND policy_id IN (");
                dataQuery.append(" AND policy_id IN (");
                for (int i = 0; i < ids.length; i++) {
                    if (i > 0) {
                        countQuery.append(",");
                        dataQuery.append(",");
                    }
                    countQuery.append("?");
                    dataQuery.append("?");
                    params.add(Long.parseLong(ids[i].trim()));
                }
                countQuery.append(")");
                dataQuery.append(")");
            }
        }

        if (search != null && !search.isEmpty()) {
            // Try to parse as claim ID first
            try {
                Long searchId = Long.parseLong(search);
                countQuery.append(" AND claim_id = ?");
                dataQuery.append(" AND claim_id = ?");
                params.add(searchId);
            } catch (NumberFormatException e) {
                // If not a number, search in other fields
                String searchPattern = "%" + search.toLowerCase() + "%";
                countQuery.append(" AND (LOWER(claim_number) LIKE ? OR LOWER(claim_type::text) LIKE ? OR LOWER(claim_status::text) LIKE ? OR LOWER(description) LIKE ?)");
                dataQuery.append(" AND (LOWER(claim_number) LIKE ? OR LOWER(claim_type::text) LIKE ? OR LOWER(claim_status::text) LIKE ? OR LOWER(description) LIKE ?)");
                // Add search pattern for each field
                for (int i = 0; i < 4; i++) {
                    params.add(searchPattern);
                }
            }
        }

        // Add sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            dataQuery.append(" ORDER BY ").append(sortBy).append(" ").append(sortOrder);
        } else {
            dataQuery.append(" ORDER BY claim_id ").append(sortOrder);
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
        List<Claim> claims = getJdbcTemplate(databaseType).query(
            dataQuery.toString(),
            claimRowMapper,
            params.toArray()
        );

        return new ClaimResponse(claims, totalCount);
    }

    public Claim create(Claim claim, DatabaseType databaseType) {
        // Validate required fields
        if (claim.getPolicyId() == null) {
            throw new IllegalArgumentException("Policy ID is required");
        }
        if (claim.getClaimType() == null || claim.getClaimType().trim().isEmpty()) {
            throw new IllegalArgumentException("Claim Type is required");
        }
        if (claim.getClaimStatus() == null || claim.getClaimStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("Claim Status is required");
        }

        // Get the next available claim ID
        Long nextId = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT COALESCE(MAX(claim_id), 0) + 1
            FROM insurance.claims
            """,
            Long.class
        );

        // Insert with the generated ID
        getJdbcTemplate(databaseType).update(
            """
            INSERT INTO insurance.claims (
                claim_id, policy_id, claim_number, claim_type, claim_status, filed_date, incident_date, claim_amount, settlement_amount, description
            ) VALUES (?, ?, ?, ?::insurance.claim_type_enum, ?::insurance.claim_status_enum, ?, ?, ?, ?, ?)
            """,
            nextId,
            claim.getPolicyId(),
            claim.getClaimNumber(),
            claim.getClaimType(),
            claim.getClaimStatus(),
            claim.getFiledDate(),
            claim.getIncidentDate(),
            claim.getClaimAmount(),
            claim.getSettlementAmount(),
            claim.getDescription()
        );

        claim.setClaimId(nextId);
        return claim;
    }

    public Claim updateStatus(Long claimId, String status, DatabaseType databaseType) {
        // Validate claim exists
        Claim existingClaim = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT claim_id, policy_id, claim_number, claim_type, claim_status, filed_date, incident_date, claim_amount, settlement_amount, description
            FROM insurance.claims
            WHERE claim_id = ?
            """,
            claimRowMapper,
            claimId
        );

        if (existingClaim == null) {
            throw new IllegalArgumentException("Claim not found with ID: " + claimId);
        }

        // Update status
        getJdbcTemplate(databaseType).update(
            """
            UPDATE insurance.claims
            SET claim_status = ?::insurance.claim_status_enum
            WHERE claim_id = ?
            """,
            status, claimId
        );

        // Return updated claim
        return getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT claim_id, policy_id, claim_number, claim_type, claim_status, filed_date, incident_date, claim_amount, settlement_amount, description
            FROM insurance.claims
            WHERE claim_id = ?
            """,
            claimRowMapper,
            claimId
        );
    }

    public void deleteById(Long claimId, DatabaseType databaseType) {
        getJdbcTemplate(databaseType).update(
            "DELETE FROM insurance.claims WHERE claim_id = ?",
            claimId
        );
    }
}
