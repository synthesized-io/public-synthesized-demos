package io.synthesized.sample.bank.service;

import io.synthesized.sample.bank.model.Account;
import io.synthesized.sample.bank.model.AccountResponse;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AccountService {
    private final AccountRepository accountRepository;

    @Autowired
    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public AccountResponse getAccountsByFilters(
            DatabaseType databaseType,
            int page,
            int size,
            String sortBy,
            String sortOrder,
            String accountType,
            String status,
            String accountId,
            String search) {
        return accountRepository.findByFilters(databaseType, page, size, sortBy, sortOrder, accountType, status, accountId, search);
    }

    public Account createAccount(Account account, DatabaseType databaseType) {
        return accountRepository.create(account, databaseType);
    }

    public Account updateAccountStatus(Integer accountId, String status, DatabaseType databaseType) {
        // Validate status
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        // Additional business logic validation can be added here
        // For example, you might want to prevent certain status changes based on account type or current status

        return accountRepository.updateStatus(accountId, status, databaseType);
    }

    public java.util.Map<String, Integer> getAccountStatusCounts(DatabaseType databaseType) {
        return accountRepository.countAccountsByStatus(databaseType);
    }

    public void deleteAccount(int accountId, DatabaseType databaseType) {
        accountRepository.deleteById(accountId, databaseType);
    }
} 