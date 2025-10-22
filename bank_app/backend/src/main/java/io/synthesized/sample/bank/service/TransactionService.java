package io.synthesized.sample.bank.service;

import io.synthesized.sample.bank.model.Transaction;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.model.TransactionResponse;
import io.synthesized.sample.bank.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> getAllTransactions(DatabaseType databaseType) {
        return transactionRepository.findAll(databaseType);
    }

    public TransactionResponse getFilteredTransactions(
            DatabaseType databaseType,
            String transactionType,
            String accountId,
            String searchQuery,
            String sortBy,
            String sortOrder,
            int page,
            int size) {
        return transactionRepository.findByFilters(
            databaseType,
            transactionType,
            null,
            searchQuery,
            sortBy,
            sortOrder,
            page,
            size,
            accountId
        );
    }

    public Transaction createTransaction(Transaction transaction, DatabaseType databaseType) {
        return transactionRepository.create(transaction, databaseType);
    }

    public TransactionResponse getTransactionsByFilters(
            DatabaseType databaseType,
            String transactionType,
            String transactionId,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size,
            String accountIds) {
        return transactionRepository.findByFilters(
            databaseType,
            transactionType,
            transactionId,
            search,
            sortBy,
            sortOrder,
            page,
            size,
            accountIds
        );
    }

    public void deleteTransaction(int transactionId, DatabaseType databaseType) {
        transactionRepository.deleteById(transactionId, databaseType);
    }
} 