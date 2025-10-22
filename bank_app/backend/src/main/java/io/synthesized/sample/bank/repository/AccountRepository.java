package io.synthesized.sample.bank.repository;

import io.synthesized.sample.bank.model.Account;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.model.AccountResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.ArrayList;

@Repository
public class AccountRepository {
    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public AccountRepository(
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

    private final RowMapper<Account> accountRowMapper = (rs, rowNum) -> {
        Account account = new Account();
        account.setAccountId(rs.getInt("account_id"));
        account.setCustomerId(rs.getInt("customer_id"));
        account.setAccountType(rs.getString("account_type"));
        account.setStatus(rs.getString("status"));
        account.setBalance(rs.getBigDecimal("balance"));
        return account;
    };

    public List<Account> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            """
            SELECT account_id, customer_id, account_type, status, balance
            FROM bank.accounts
            ORDER BY account_id ASC
            """,
            accountRowMapper
        );
    }

    public AccountResponse findByFilters(
            DatabaseType databaseType,
            int page,
            int size,
            String sortBy,
            String sortOrder,
            String accountType,
            String status,
            String accountId,
            String search) {
        
        StringBuilder countQuery = new StringBuilder(
            """
            SELECT COUNT(*)
            FROM bank.accounts
            WHERE 1=1
            """
        );
        
        StringBuilder dataQuery = new StringBuilder(
            """
            SELECT account_id, customer_id, account_type, status, balance
            FROM bank.accounts
            WHERE 1=1
            """
        );
        
        List<Object> params = new ArrayList<>();
        
        if (accountType != null && !accountType.isEmpty()) {
            countQuery.append(" AND account_type = ?::bank.account_type_enum");
            dataQuery.append(" AND account_type = ?::bank.account_type_enum");
            params.add(accountType);
        }
        
        if (status != null && !status.isEmpty()) {
            countQuery.append(" AND status = ?::bank.account_status_enum");
            dataQuery.append(" AND status = ?::bank.account_status_enum");
            params.add(status);
        }

        if (accountId != null && !accountId.isEmpty()) {
            countQuery.append(" AND account_id = ?");
            dataQuery.append(" AND account_id = ?");
            params.add(Integer.parseInt(accountId));
        } else if (search != null && !search.isEmpty()) {
            // Try to parse as account ID first
            try {
                Integer searchAccountId = Integer.parseInt(search);
                countQuery.append(" AND account_id = ?");
                dataQuery.append(" AND account_id = ?");
                params.add(searchAccountId);
            } catch (NumberFormatException e) {
                // If not a number, search in other fields
                String searchPattern = "%" + search.toLowerCase() + "%";
                countQuery.append(" AND (LOWER(CAST(account_id AS TEXT)) LIKE ? OR LOWER(account_type::text) LIKE ? OR LOWER(status::text) LIKE ? OR LOWER(CAST(balance AS TEXT)) LIKE ?)");
                dataQuery.append(" AND (LOWER(CAST(account_id AS TEXT)) LIKE ? OR LOWER(account_type::text) LIKE ? OR LOWER(status::text) LIKE ? OR LOWER(CAST(balance AS TEXT)) LIKE ?)");
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
            dataQuery.append(" ORDER BY account_id ").append(sortOrder);
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
        List<Account> accounts = getJdbcTemplate(databaseType).query(
            dataQuery.toString(),
            accountRowMapper,
            params.toArray()
        );
        
        return new AccountResponse(accounts, totalCount);
    }

    public Account create(Account account, DatabaseType databaseType) {
        // Validate required fields
        if (account.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required");
        }
        if (account.getAccountType() == null || account.getAccountType().trim().isEmpty()) {
            throw new IllegalArgumentException("Account Type is required");
        }
        if (account.getStatus() == null || account.getStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }
        if (account.getBalance() == null) {
            throw new IllegalArgumentException("Balance is required");
        }

        // Get the next available account ID
        Integer nextId = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT COALESCE(MAX(account_id), 0) + 1
            FROM bank.accounts
            """,
            Integer.class
        );

        // Insert with the generated ID
        getJdbcTemplate(databaseType).update(
            """
            INSERT INTO bank.accounts (
                customer_id, account_type, status, balance
            ) VALUES (?, ?::bank.account_type_enum, ?::bank.account_status_enum, ?)
            """,
            account.getCustomerId(),
            account.getAccountType(),
            account.getStatus(),
            account.getBalance()
        );

        account.setAccountId(nextId);
        return account;
    }

    public Account updateStatus(Integer accountId, String status, DatabaseType databaseType) {
        // Validate account exists
        Account existingAccount = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT account_id, customer_id, account_type, status, balance
            FROM bank.accounts
            WHERE account_id = ?
            """,
            accountRowMapper,
            accountId
        );

        if (existingAccount == null) {
            throw new IllegalArgumentException("Account not found with ID: " + accountId);
        }

        // Update status
        getJdbcTemplate(databaseType).update(
            """
            UPDATE bank.accounts
            SET status = ?::bank.account_status_enum
            WHERE account_id = ?
            """,
            status, accountId
        );

        // Return updated account
        return getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT account_id, customer_id, account_type, status, balance
            FROM bank.accounts
            WHERE account_id = ?
            """,
            accountRowMapper,
            accountId
        );
    }

    public java.util.Map<String, Integer> countAccountsByStatus(DatabaseType databaseType) {
        String sql = "SELECT status, COUNT(*) as count FROM bank.accounts GROUP BY status";
        return getJdbcTemplate(databaseType).query(sql, rs -> {
            java.util.Map<String, Integer> result = new java.util.HashMap<>();
            while (rs.next()) {
                result.put(rs.getString("status"), rs.getInt("count"));
            }
            return result;
        });
    }

    public void deleteById(int accountId, DatabaseType databaseType) {
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
        // Then delete the account
        getJdbcTemplate(databaseType).update(
            "DELETE FROM bank.accounts WHERE account_id = ?",
            accountId
        );
    }
} 