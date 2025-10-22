package io.synthesized.sample.bank.repository;

import io.synthesized.sample.bank.model.Branch;
import io.synthesized.sample.bank.model.DatabaseType;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BranchRepository {

    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    public BranchRepository(
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

    private final RowMapper<Branch> branchRowMapper = (rs, rowNum) -> {
        Branch branch = new Branch();
        branch.setBranchId(rs.getInt("branch_id"));
        branch.setName(rs.getString("name"));
        branch.setRegion(rs.getString("region"));
        branch.setManagerName(rs.getString("manager_name"));
        return branch;
    };

    public List<Branch> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            "SELECT branch_id, name, region, manager_name FROM bank.branches",
            branchRowMapper
        );
    }

    public void updateManager(DatabaseType databaseType, Long branchId, String managerName) {
        getJdbcTemplate(databaseType).update(
            "UPDATE bank.branches SET manager_name = ? WHERE branch_id = ?",
            managerName, branchId
        );
    }

    public void deleteById(DatabaseType databaseType, Integer branchId) {
        getJdbcTemplate(databaseType).update(
            "DELETE FROM bank.branches WHERE branch_id = ?",
            branchId
        );
    }

    public Branch create(DatabaseType databaseType, Branch branch) {
        String sql = "INSERT INTO bank.branches (name, region, manager_name) VALUES (?, ?::bank.region_enum, ?) RETURNING branch_id, name, region, manager_name";
        return getJdbcTemplate(databaseType).queryForObject(
            sql,
            branchRowMapper,
            branch.getName(),
            branch.getRegion(),
            branch.getManagerName()
        );
    }
} 