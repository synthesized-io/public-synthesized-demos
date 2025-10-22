package io.synthesized.sample.bank.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import io.synthesized.sample.bank.model.Statistics;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.repository.StatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import io.synthesized.sample.bank.service.AccountService;

@Service
public class StatisticsService {
    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);
    
    private final StatisticsRepository statisticsRepository;
    @Autowired
    private AccountService accountService;

    public StatisticsService(StatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    public Statistics getStatistics(DatabaseType databaseType) {
        try {
            logger.info("Fetching statistics for database type: {}", databaseType);
            
            Statistics stats = new Statistics();
            
            try {
                stats.setTotalTransactions(statisticsRepository.getTransactionCount(databaseType));
                logger.debug("Total transactions: {}", stats.getTotalTransactions());
            } catch (Exception e) {
                logger.error("Error fetching transactions count: {}", e.getMessage(), e);
                throw e;
            }
            
            try {
                stats.setTotalCustomers(statisticsRepository.getCustomerCount(databaseType));
                logger.debug("Total customers: {}", stats.getTotalCustomers());
            } catch (Exception e) {
                logger.error("Error fetching customers count: {}", e.getMessage(), e);
                throw e;
            }
            
            try {
                stats.setTotalAccounts(statisticsRepository.getAccountCount(databaseType));
                logger.debug("Total accounts: {}", stats.getTotalAccounts());
            } catch (Exception e) {
                logger.error("Error fetching accounts count: {}", e.getMessage(), e);
                throw e;
            }
            
            try {
                stats.setTotalBranches(statisticsRepository.getBranchCount(databaseType));
                logger.debug("Total branches: {}", stats.getTotalBranches());
            } catch (Exception e) {
                logger.error("Error fetching branches count: {}", e.getMessage(), e);
                throw e;
            }
            
            return stats;
        } catch (Exception e) {
            logger.error("Error getting statistics for database type {}: {}", databaseType, e.getMessage(), e);
            throw new RuntimeException("Failed to get statistics: " + e.getMessage(), e);
        }
    }

    public long getTransactionCount(DatabaseType databaseType) {
        return statisticsRepository.getTransactionCount(databaseType);
    }

    public long getCustomerCount(DatabaseType databaseType) {
        return statisticsRepository.getCustomerCount(databaseType);
    }

    public long getAccountCount(DatabaseType databaseType) {
        return statisticsRepository.getAccountCount(databaseType);
    }

    public long getBranchCount(DatabaseType databaseType) {
        return statisticsRepository.getBranchCount(databaseType);
    }

    public java.util.Map<String, Integer> getAccountStatusCounts(DatabaseType database) {
        return accountService.getAccountStatusCounts(database);
    }
} 