package io.synthesized.sample.bank.repository;

import io.synthesized.sample.bank.model.Transaction;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.model.TransactionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.ArrayList;

@Repository
public class TransactionRepository {
    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public TransactionRepository(
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

    private final RowMapper<Transaction> transactionRowMapper = (rs, rowNum) -> {
        Transaction transaction = new Transaction();
        transaction.setTransactionId(rs.getInt("transaction_id"));
        transaction.setAccountId(rs.getInt("account_id"));
        transaction.setTransactionType(rs.getString("transaction_type"));
        transaction.setTransactionDate(rs.getTimestamp("transaction_date").toLocalDateTime());
        transaction.setAmount(rs.getBigDecimal("amount"));
        transaction.setChannel(rs.getString("channel"));
        transaction.setCurrency(rs.getString("currency"));
        transaction.setChannelDetails(rs.getString("channel_details"));
        transaction.setLocation(rs.getString("location"));
        transaction.setDeviceType(rs.getString("device_type"));
        transaction.setAuthMethod(rs.getString("auth_method"));
        return transaction;
    };

    public List<Transaction> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            """
            SELECT t.*, tm.channel_details, tm.location, tm.device_type, tm.auth_method
            FROM bank.transactions t
            LEFT JOIN bank.transaction_metadata tm ON t.transaction_id = tm.transaction_id
            ORDER BY t.transaction_id
            """,
            transactionRowMapper
        );
    }

    public TransactionResponse findByFilters(
            DatabaseType databaseType,
            String transactionType,
            String transactionId,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size,
            String accountIds) {
        
        StringBuilder countQuery = new StringBuilder(
            """
            SELECT COUNT(*)
            FROM bank.transactions t
            LEFT JOIN bank.transaction_metadata tm ON t.transaction_id = tm.transaction_id
            WHERE 1=1
            """
        );
        
        StringBuilder dataQuery = new StringBuilder(
            """
            SELECT t.*, tm.channel_details, tm.location, tm.device_type, tm.auth_method
            FROM bank.transactions t
            LEFT JOIN bank.transaction_metadata tm ON t.transaction_id = tm.transaction_id
            WHERE 1=1
            """
        );
        
        List<Object> params = new ArrayList<>();
        
        if (transactionType != null && !transactionType.isEmpty()) {
            countQuery.append(" AND t.transaction_type = ?::bank.transaction_type_enum");
            dataQuery.append(" AND t.transaction_type = ?::bank.transaction_type_enum");
            params.add(transactionType);
        }
        
        if (transactionId != null && !transactionId.isEmpty()) {
            countQuery.append(" AND t.transaction_id = ?");
            dataQuery.append(" AND t.transaction_id = ?");
            params.add(Integer.parseInt(transactionId));
        }

        if (accountIds != null && !accountIds.isEmpty()) {
            String[] ids = accountIds.split(",");
            if (ids.length > 0) {
                countQuery.append(" AND t.account_id IN (");
                dataQuery.append(" AND t.account_id IN (");
                for (int i = 0; i < ids.length; i++) {
                    if (i > 0) {
                        countQuery.append(",");
                        dataQuery.append(",");
                    }
                    countQuery.append("?");
                    dataQuery.append("?");
                    params.add(Integer.parseInt(ids[i].trim()));
                }
                countQuery.append(")");
                dataQuery.append(")");
            }
        }
        
        if (search != null && !search.isEmpty()) {
            // Try to parse as transaction ID first
            try {
                Integer searchId = Integer.parseInt(search);
                countQuery.append(" AND t.transaction_id = ?");
                dataQuery.append(" AND t.transaction_id = ?");
                params.add(searchId);
            } catch (NumberFormatException e) {
                // If not a number, search in other fields
                String searchPattern = "%" + search.toLowerCase() + "%";
                countQuery.append(" AND (LOWER(t.transaction_type::text) LIKE ? OR LOWER(CAST(t.amount AS TEXT)) LIKE ? OR LOWER(t.channel::text) LIKE ? OR LOWER(t.currency::text) LIKE ? OR LOWER(tm.location) LIKE ? OR LOWER(tm.device_type::text) LIKE ? OR LOWER(tm.auth_method::text) LIKE ?)");
                dataQuery.append(" AND (LOWER(t.transaction_type::text) LIKE ? OR LOWER(CAST(t.amount AS TEXT)) LIKE ? OR LOWER(t.channel::text) LIKE ? OR LOWER(t.currency::text) LIKE ? OR LOWER(tm.location) LIKE ? OR LOWER(tm.device_type::text) LIKE ? OR LOWER(tm.auth_method::text) LIKE ?)");
                // Add search pattern for each field
                for (int i = 0; i < 7; i++) {
                    params.add(searchPattern);
                }
            }
        }
        
        // Add sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            dataQuery.append(" ORDER BY t.").append(sortBy).append(" ").append(sortOrder);
        } else {
            dataQuery.append(" ORDER BY t.transaction_id ").append(sortOrder);
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
        List<Transaction> transactions = getJdbcTemplate(databaseType).query(
            dataQuery.toString(),
            transactionRowMapper,
            params.toArray()
        );
        
        return new TransactionResponse(transactions, totalCount);
    }

    public Transaction create(Transaction transaction, DatabaseType databaseType) {
        // Validate required fields
        if (transaction.getAccountId() == null) {
            throw new IllegalArgumentException("Account ID is required");
        }
        if (transaction.getTransactionType() == null || transaction.getTransactionType().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction Type is required");
        }
        if (transaction.getAmount() == null) {
            throw new IllegalArgumentException("Amount is required");
        }

        // Get the next available transaction ID
        Integer nextId = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT COALESCE(MAX(transaction_id), 0) + 1
            FROM bank.transactions
            """,
            Integer.class
        );

        // Insert into transactions table with the generated ID
        getJdbcTemplate(databaseType).update(
            """
            INSERT INTO bank.transactions (
                transaction_id, account_id, transaction_type, transaction_date, 
                amount, currency, channel
            ) VALUES (?, ?, ?::bank.transaction_type_enum, ?, ?, ?::bank.currency_enum, ?::bank.channel_enum)
            """,
            nextId,
            transaction.getAccountId(),
            transaction.getTransactionType(),
            transaction.getTransactionDate(),
            transaction.getAmount(),
            transaction.getCurrency() != null ? transaction.getCurrency() : "USD",
            transaction.getChannel()
        );

        transaction.setTransactionId(nextId);

        // Insert into transaction_metadata table
        getJdbcTemplate(databaseType).update(
            """
            INSERT INTO bank.transaction_metadata (
                transaction_id, location, device_type, auth_method
            ) VALUES (?, ?, ?::bank.device_type_enum, ?::bank.auth_method_enum)
            """,
            nextId,
            transaction.getLocation(),
            transaction.getDeviceType(),
            transaction.getAuthMethod()
        );

        return transaction;
    }

    public void deleteById(int transactionId, DatabaseType databaseType) {
        // Delete from transaction_metadata first due to FK constraint
        getJdbcTemplate(databaseType).update(
            "DELETE FROM bank.transaction_metadata WHERE transaction_id = ?",
            transactionId
        );
        // Then delete from transactions
        getJdbcTemplate(databaseType).update(
            "DELETE FROM bank.transactions WHERE transaction_id = ?",
            transactionId
        );
    }
} 