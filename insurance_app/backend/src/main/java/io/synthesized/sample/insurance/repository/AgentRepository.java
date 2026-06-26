package io.synthesized.sample.insurance.repository;

import io.synthesized.sample.insurance.model.Agent;
import io.synthesized.sample.insurance.model.DatabaseType;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.ArrayList;

@Repository
public class AgentRepository {

    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    public AgentRepository(
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

    private final RowMapper<Agent> agentRowMapper = (rs, rowNum) -> {
        Agent agent = new Agent();
        agent.setAgentId(rs.getLong("agent_id"));
        agent.setFirstName(rs.getString("first_name"));
        agent.setLastName(rs.getString("last_name"));
        agent.setEmail(rs.getString("email"));
        agent.setPhone(rs.getString("phone"));
        agent.setRegion(rs.getString("region"));
        agent.setLicenseNumber(rs.getString("license_number"));
        return agent;
    };

    public List<Agent> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            "SELECT agent_id, first_name, last_name, email, phone, region, license_number FROM insurance.agents ORDER BY agent_id",
            agentRowMapper
        );
    }

    public List<Agent> findByFilters(DatabaseType databaseType, String region, int page, int size, String sortBy, String sortOrder) {
        StringBuilder sql = new StringBuilder(
            "SELECT agent_id, first_name, last_name, email, phone, region, license_number FROM insurance.agents WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (region != null && !region.isEmpty()) {
            sql.append(" AND region = ?");
            params.add(region);
        }

        sql.append(" ORDER BY ").append(sortBy).append(" ").append(sortOrder);
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return getJdbcTemplate(databaseType).query(sql.toString(), agentRowMapper, params.toArray());
    }

    public int count(DatabaseType databaseType, String region) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM insurance.agents WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (region != null && !region.isEmpty()) {
            sql.append(" AND region = ?");
            params.add(region);
        }

        return getJdbcTemplate(databaseType).queryForObject(sql.toString(), params.toArray(), Integer.class);
    }

    public Agent findById(DatabaseType databaseType, Long agentId) {
        String sql = "SELECT agent_id, first_name, last_name, email, phone, region, license_number FROM insurance.agents WHERE agent_id = ?";
        return getJdbcTemplate(databaseType).queryForObject(sql, agentRowMapper, agentId);
    }

    public Agent create(DatabaseType databaseType, Agent agent) {
        String sql = "INSERT INTO insurance.agents (first_name, last_name, email, phone, region, license_number) " +
                     "VALUES (?, ?, ?, ?, ?, ?) RETURNING agent_id, first_name, last_name, email, phone, region, license_number";
        return getJdbcTemplate(databaseType).queryForObject(
            sql,
            agentRowMapper,
            agent.getFirstName(),
            agent.getLastName(),
            agent.getEmail(),
            agent.getPhone(),
            agent.getRegion(),
            agent.getLicenseNumber()
        );
    }

    public Agent update(DatabaseType databaseType, Long agentId, Agent agent) {
        String sql = "UPDATE insurance.agents SET first_name = ?, last_name = ?, email = ?, phone = ?, region = ?, license_number = ? WHERE agent_id = ?";
        getJdbcTemplate(databaseType).update(
            sql,
            agent.getFirstName(),
            agent.getLastName(),
            agent.getEmail(),
            agent.getPhone(),
            agent.getRegion(),
            agent.getLicenseNumber(),
            agentId
        );
        return findById(databaseType, agentId);
    }

    public void updateRegion(DatabaseType databaseType, Long agentId, String region) {
        String sql = "UPDATE insurance.agents SET region = ?::insurance.agent_region_enum WHERE agent_id = ?";
        getJdbcTemplate(databaseType).update(sql, region, agentId);
    }

    public void deleteById(DatabaseType databaseType, Long agentId) {
        getJdbcTemplate(databaseType).update(
            "DELETE FROM insurance.agents WHERE agent_id = ?",
            agentId
        );
    }
}
