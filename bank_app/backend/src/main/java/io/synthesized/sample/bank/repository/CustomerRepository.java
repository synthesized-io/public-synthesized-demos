package io.synthesized.sample.bank.repository;

import io.synthesized.sample.bank.model.Customer;
import io.synthesized.sample.bank.model.DatabaseType;
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
public class CustomerRepository {

    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public CustomerRepository(
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

    private final RowMapper<Customer> customerRowMapper = (rs, rowNum) -> {
        Customer customer = new Customer();
        customer.setCustomerId(rs.getLong("customer_id"));
        customer.setFirstName(rs.getString("first_name"));
        customer.setLastName(rs.getString("last_name"));
        customer.setEmail(rs.getString("email"));
        customer.setPhone(rs.getString("phone"));
        customer.setCustomerType(rs.getString("customer_type"));
        customer.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return customer;
    };

    public List<Customer> findAll(String database, int page, int size, String sortBy, String sortOrder,
                                String customerType, String searchQuery, String customerId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        StringBuilder sql = new StringBuilder(
            "SELECT c.*, array_agg(ca.account_id) as account_ids " +
            "FROM bank.customers c " +
            "LEFT JOIN bank.accounts ca ON c.customer_id = ca.customer_id " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (customerType != null && !customerType.isEmpty()) {
            sql.append(" AND c.customer_type = ?::bank.customer_type_enum");
            params.add(customerType);
        }
        if (customerId != null && !customerId.isEmpty()) {
            sql.append(" AND c.customer_id = ?");
            params.add(Long.parseLong(customerId));
        } else if (searchQuery != null && !searchQuery.isEmpty()) {
            sql.append(" AND (LOWER(c.first_name) LIKE LOWER(?) OR LOWER(c.last_name) LIKE LOWER(?) OR LOWER(c.email) LIKE LOWER(?))");
            String q = "%" + searchQuery + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }
        sql.append(" GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.phone, c.customer_type, c.created_at");
        sql.append(" ORDER BY c.").append(sortBy).append(" ").append(sortOrder);
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return getJdbcTemplate(databaseType).query(sql.toString(), (rs, rowNum) -> {
            Customer customer = customerRowMapper.mapRow(rs, rowNum);
            Array accountIdsArray = rs.getArray("account_ids");
            if (accountIdsArray != null) {
                Integer[] accountIds = (Integer[]) accountIdsArray.getArray();
                customer.setAccountIds(Arrays.stream(accountIds)
                    .filter(id -> id != null)
                    .map(Integer::longValue)
                    .collect(Collectors.toList()));
            } else {
                customer.setAccountIds(new ArrayList<>());
            }
            return customer;
        }, params.toArray());
    }

    public int count(String database, String customerType, String searchQuery, String customerId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        StringBuilder sql = new StringBuilder(
            "SELECT COUNT(DISTINCT c.customer_id) " +
            "FROM bank.customers c " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (customerType != null && !customerType.isEmpty()) {
            sql.append(" AND c.customer_type = ?::bank.customer_type_enum");
            params.add(customerType);
        }
        if (customerId != null && !customerId.isEmpty()) {
            sql.append(" AND c.customer_id = ?");
            params.add(Long.parseLong(customerId));
        } else if (searchQuery != null && !searchQuery.isEmpty()) {
            sql.append(" AND (LOWER(c.first_name) LIKE LOWER(?) OR LOWER(c.last_name) LIKE LOWER(?) OR LOWER(c.email) LIKE LOWER(?))");
            String q = "%" + searchQuery + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }

        return getJdbcTemplate(databaseType).queryForObject(sql.toString(), params.toArray(), Integer.class);
    }

    public Customer findById(String database, Long customerId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        String sql = 
            "SELECT c.*, array_agg(ca.account_id) as account_ids " +
            "FROM bank.customers c " +
            "LEFT JOIN bank.accounts ca ON c.customer_id = ca.customer_id " +
            "WHERE c.customer_id = ? " +
            "GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.phone, c.customer_type, c.created_at";
        
        return getJdbcTemplate(databaseType).queryForObject(sql, (rs, rowNum) -> {
            Customer customer = customerRowMapper.mapRow(rs, rowNum);
            Array accountIdsArray = rs.getArray("account_ids");
            if (accountIdsArray != null) {
                Integer[] accountIds = (Integer[]) accountIdsArray.getArray();
                customer.setAccountIds(Arrays.stream(accountIds)
                    .filter(id -> id != null)
                    .map(Integer::longValue)
                    .collect(Collectors.toList()));
            } else {
                customer.setAccountIds(new ArrayList<>());
            }
            return customer;
        }, customerId);
    }

    public Customer create(String database, Customer customer) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        String sql = "INSERT INTO bank.customers (first_name, last_name, email, phone, customer_type) " +
                "VALUES (?, ?, ?, ?, ?::bank.customer_type_enum) RETURNING *";
        
        return getJdbcTemplate(databaseType).queryForObject(sql, customerRowMapper,
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getCustomerType());
    }

    public void deleteById(String database, Long customerId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        // Get all account IDs for this customer
        List<Integer> accountIds = getJdbcTemplate(databaseType).query(
            "SELECT account_id FROM bank.accounts WHERE customer_id = ?",
            (rs, rowNum) -> rs.getInt("account_id"),
            customerId
        );
        for (Integer accountId : accountIds) {
            // Delete transaction metadata for all transactions of this account
            getJdbcTemplate(databaseType).update(
                "DELETE FROM bank.transaction_metadata WHERE transaction_id IN (SELECT transaction_id FROM bank.transactions WHERE account_id = ?)",
                accountId
            );
            // Delete related transactions
            getJdbcTemplate(databaseType).update(
                "DELETE FROM bank.transactions WHERE account_id = ?",
                accountId
            );
            // Delete the account
            getJdbcTemplate(databaseType).update(
                "DELETE FROM bank.accounts WHERE account_id = ?",
                accountId
            );
        }
        // Finally, delete the customer
        getJdbcTemplate(databaseType).update(
            "DELETE FROM bank.customers WHERE customer_id = ?",
            customerId
        );
    }
} 