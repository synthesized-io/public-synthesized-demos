package io.synthesized.sample.insurance.repository;

import io.synthesized.sample.insurance.model.Policyholder;
import io.synthesized.sample.insurance.model.DatabaseType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.sql.Array;
import java.util.stream.Collectors;

@Repository
public class PolicyholderRepository {

    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public PolicyholderRepository(
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

    private final RowMapper<Policyholder> policyholderRowMapper = (rs, rowNum) -> {
        Policyholder policyholder = new Policyholder();
        policyholder.setPolicyholderId(rs.getLong("policyholder_id"));
        policyholder.setFirstName(rs.getString("first_name"));
        policyholder.setLastName(rs.getString("last_name"));
        policyholder.setEmail(rs.getString("email"));
        policyholder.setPhone(rs.getString("phone"));
        java.sql.Date dateOfBirth = rs.getDate("date_of_birth");
        policyholder.setDateOfBirth(dateOfBirth != null ? dateOfBirth.toLocalDate() : null);
        policyholder.setPolicyholderType(rs.getString("policyholder_type"));
        policyholder.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return policyholder;
    };

    public List<Policyholder> findAll(String database, int page, int size, String sortBy, String sortOrder,
                                String policyholderType, String searchQuery, String policyholderId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        StringBuilder sql = new StringBuilder(
            "SELECT p.*, array_agg(po.policy_id) as policy_ids " +
            "FROM insurance.policyholders p " +
            "LEFT JOIN insurance.policies po ON p.policyholder_id = po.policyholder_id " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (policyholderType != null && !policyholderType.isEmpty()) {
            sql.append(" AND p.policyholder_type = ?::insurance.policyholder_type_enum");
            params.add(policyholderType);
        }
        if (policyholderId != null && !policyholderId.isEmpty()) {
            sql.append(" AND p.policyholder_id = ?");
            params.add(Long.parseLong(policyholderId));
        } else if (searchQuery != null && !searchQuery.isEmpty()) {
            sql.append(" AND (LOWER(p.first_name) LIKE LOWER(?) OR LOWER(p.last_name) LIKE LOWER(?) OR LOWER(p.email) LIKE LOWER(?))");
            String q = "%" + searchQuery + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }
        sql.append(" GROUP BY p.policyholder_id, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth, p.policyholder_type, p.created_at");
        sql.append(" ORDER BY p.").append(sortBy).append(" ").append(sortOrder);
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return getJdbcTemplate(databaseType).query(sql.toString(), (rs, rowNum) -> {
            Policyholder policyholder = policyholderRowMapper.mapRow(rs, rowNum);
            Array policyIdsArray = rs.getArray("policy_ids");
            if (policyIdsArray != null) {
                Object[] policyIdsObj = (Object[]) policyIdsArray.getArray();
                policyholder.setPolicyIds(Arrays.stream(policyIdsObj)
                    .filter(id -> id != null)
                    .map(id -> id instanceof Integer ? ((Integer) id).longValue() : (Long) id)
                    .collect(Collectors.toList()));
            } else {
                policyholder.setPolicyIds(new ArrayList<>());
            }
            return policyholder;
        }, params.toArray());
    }

    public int count(String database, String policyholderType, String searchQuery, String policyholderId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        StringBuilder sql = new StringBuilder(
            "SELECT COUNT(DISTINCT p.policyholder_id) " +
            "FROM insurance.policyholders p " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (policyholderType != null && !policyholderType.isEmpty()) {
            sql.append(" AND p.policyholder_type = ?::insurance.policyholder_type_enum");
            params.add(policyholderType);
        }
        if (policyholderId != null && !policyholderId.isEmpty()) {
            sql.append(" AND p.policyholder_id = ?");
            params.add(Long.parseLong(policyholderId));
        } else if (searchQuery != null && !searchQuery.isEmpty()) {
            sql.append(" AND (LOWER(p.first_name) LIKE LOWER(?) OR LOWER(p.last_name) LIKE LOWER(?) OR LOWER(p.email) LIKE LOWER(?))");
            String q = "%" + searchQuery + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }

        return getJdbcTemplate(databaseType).queryForObject(sql.toString(), params.toArray(), Integer.class);
    }

    public Policyholder findById(String database, Long policyholderId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        String sql =
            "SELECT p.*, array_agg(po.policy_id) as policy_ids " +
            "FROM insurance.policyholders p " +
            "LEFT JOIN insurance.policies po ON p.policyholder_id = po.policyholder_id " +
            "WHERE p.policyholder_id = ? " +
            "GROUP BY p.policyholder_id, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth, p.policyholder_type, p.created_at";

        return getJdbcTemplate(databaseType).queryForObject(sql, (rs, rowNum) -> {
            Policyholder policyholder = policyholderRowMapper.mapRow(rs, rowNum);
            Array policyIdsArray = rs.getArray("policy_ids");
            if (policyIdsArray != null) {
                Object[] policyIdsObj = (Object[]) policyIdsArray.getArray();
                policyholder.setPolicyIds(Arrays.stream(policyIdsObj)
                    .filter(id -> id != null)
                    .map(id -> id instanceof Integer ? ((Integer) id).longValue() : (Long) id)
                    .collect(Collectors.toList()));
            } else {
                policyholder.setPolicyIds(new ArrayList<>());
            }
            return policyholder;
        }, policyholderId);
    }

    public Policyholder create(String database, Policyholder policyholder) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        String sql = "INSERT INTO insurance.policyholders (first_name, last_name, email, phone, date_of_birth, policyholder_type) " +
                "VALUES (?, ?, ?, ?, ?, ?::insurance.policyholder_type_enum) RETURNING *";

        return getJdbcTemplate(databaseType).queryForObject(sql, policyholderRowMapper,
                policyholder.getFirstName(),
                policyholder.getLastName(),
                policyholder.getEmail(),
                policyholder.getPhone(),
                policyholder.getDateOfBirth(),
                policyholder.getPolicyholderType());
    }

    public void deleteById(String database, Long policyholderId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        // Get all policy IDs for this policyholder
        List<Long> policyIds = getJdbcTemplate(databaseType).query(
            "SELECT policy_id FROM insurance.policies WHERE policyholder_id = ?",
            (rs, rowNum) -> rs.getLong("policy_id"),
            policyholderId
        );
        for (Long policyId : policyIds) {
            // Delete related claims
            getJdbcTemplate(databaseType).update(
                "DELETE FROM insurance.claims WHERE policy_id = ?",
                policyId
            );
            // Delete the policy
            getJdbcTemplate(databaseType).update(
                "DELETE FROM insurance.policies WHERE policy_id = ?",
                policyId
            );
        }
        // Finally, delete the policyholder
        getJdbcTemplate(databaseType).update(
            "DELETE FROM insurance.policyholders WHERE policyholder_id = ?",
            policyholderId
        );
    }
}
