package io.synthesized.sample.healthcare.repository;

import io.synthesized.sample.healthcare.model.Provider;
import io.synthesized.sample.healthcare.model.DatabaseType;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.ArrayList;

@Repository
public class ProviderRepository {

    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    public ProviderRepository(
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

    private final RowMapper<Provider> providerRowMapper = (rs, rowNum) -> {
        Provider provider = new Provider();
        provider.setProviderId(rs.getLong("provider_id"));
        provider.setFirstName(rs.getString("first_name"));
        provider.setLastName(rs.getString("last_name"));
        provider.setEmail(rs.getString("email"));
        provider.setPhone(rs.getString("phone"));
        provider.setSpecialty(rs.getString("specialization"));
        provider.setLicenseNumber(rs.getString("license_number"));
        return provider;
    };

    public List<Provider> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            "SELECT provider_id, first_name, last_name, email, phone, specialization, license_number FROM healthcare.providers ORDER BY provider_id",
            providerRowMapper
        );
    }

    public List<Provider> findByFilters(DatabaseType databaseType, String specialty, int page, int size, String sortBy, String sortOrder) {
        StringBuilder sql = new StringBuilder(
            "SELECT provider_id, first_name, last_name, email, phone, specialization, license_number FROM healthcare.providers WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (specialty != null && !specialty.isEmpty()) {
            sql.append(" AND specialization = ?::healthcare.provider_specialization_enum");
            params.add(specialty);
        }

        sql.append(" ORDER BY ").append(sortBy).append(" ").append(sortOrder);
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return getJdbcTemplate(databaseType).query(sql.toString(), providerRowMapper, params.toArray());
    }

    public int count(DatabaseType databaseType, String specialty) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM healthcare.providers WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (specialty != null && !specialty.isEmpty()) {
            sql.append(" AND specialization = ?::healthcare.provider_specialization_enum");
            params.add(specialty);
        }

        return getJdbcTemplate(databaseType).queryForObject(sql.toString(), params.toArray(), Integer.class);
    }

    public Provider findById(DatabaseType databaseType, Long providerId) {
        String sql = "SELECT provider_id, first_name, last_name, email, phone, specialization, license_number FROM healthcare.providers WHERE provider_id = ?";
        return getJdbcTemplate(databaseType).queryForObject(sql, providerRowMapper, providerId);
    }

    public Provider create(DatabaseType databaseType, Provider provider) {
        String sql = "INSERT INTO healthcare.providers (first_name, last_name, email, phone, specialization, license_number) " +
                     "VALUES (?, ?, ?, ?, ?::healthcare.provider_specialization_enum, ?) RETURNING provider_id, first_name, last_name, email, phone, specialization, license_number";
        return getJdbcTemplate(databaseType).queryForObject(
            sql,
            providerRowMapper,
            provider.getFirstName(),
            provider.getLastName(),
            provider.getEmail(),
            provider.getPhone(),
            provider.getSpecialty(),
            provider.getLicenseNumber()
        );
    }

    public Provider update(DatabaseType databaseType, Long providerId, Provider provider) {
        String sql = "UPDATE healthcare.providers SET first_name = ?, last_name = ?, email = ?, phone = ?, specialization = ?::healthcare.provider_specialization_enum, license_number = ? WHERE provider_id = ?";
        getJdbcTemplate(databaseType).update(
            sql,
            provider.getFirstName(),
            provider.getLastName(),
            provider.getEmail(),
            provider.getPhone(),
            provider.getSpecialty(),
            provider.getLicenseNumber(),
            providerId
        );
        return findById(databaseType, providerId);
    }

    public void deleteById(DatabaseType databaseType, Long providerId) {
        getJdbcTemplate(databaseType).update(
            "DELETE FROM healthcare.providers WHERE provider_id = ?",
            providerId
        );
    }
}
