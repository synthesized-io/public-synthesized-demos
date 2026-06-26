package io.synthesized.sample.insurance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import io.synthesized.sample.insurance.model.Statistics;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.repository.StatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import io.synthesized.sample.insurance.service.PolicyService;

@Service
public class StatisticsService {
    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);

    private final StatisticsRepository statisticsRepository;
    @Autowired
    private PolicyService policyService;

    public StatisticsService(StatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    public Statistics getStatistics(DatabaseType databaseType) {
        try {
            logger.info("Fetching statistics for database type: {}", databaseType);

            Statistics stats = new Statistics();

            try {
                stats.setTotalClaims(statisticsRepository.getClaimCount(databaseType));
                logger.debug("Total claims: {}", stats.getTotalClaims());
            } catch (Exception e) {
                logger.error("Error fetching claims count: {}", e.getMessage(), e);
                throw e;
            }

            try {
                stats.setTotalPolicyholders(statisticsRepository.getPolicyholderCount(databaseType));
                logger.debug("Total policyholders: {}", stats.getTotalPolicyholders());
            } catch (Exception e) {
                logger.error("Error fetching policyholders count: {}", e.getMessage(), e);
                throw e;
            }

            try {
                stats.setTotalPolicies(statisticsRepository.getPolicyCount(databaseType));
                logger.debug("Total policies: {}", stats.getTotalPolicies());
            } catch (Exception e) {
                logger.error("Error fetching policies count: {}", e.getMessage(), e);
                throw e;
            }

            try {
                stats.setTotalAgents(statisticsRepository.getAgentCount(databaseType));
                logger.debug("Total agents: {}", stats.getTotalAgents());
            } catch (Exception e) {
                logger.error("Error fetching agents count: {}", e.getMessage(), e);
                throw e;
            }

            return stats;
        } catch (Exception e) {
            logger.error("Error getting statistics for database type {}: {}", databaseType, e.getMessage(), e);
            throw new RuntimeException("Failed to get statistics: " + e.getMessage(), e);
        }
    }

    public long getClaimCount(DatabaseType databaseType) {
        return statisticsRepository.getClaimCount(databaseType);
    }

    public long getPolicyholderCount(DatabaseType databaseType) {
        return statisticsRepository.getPolicyholderCount(databaseType);
    }

    public long getPolicyCount(DatabaseType databaseType) {
        return statisticsRepository.getPolicyCount(databaseType);
    }

    public long getAgentCount(DatabaseType databaseType) {
        return statisticsRepository.getAgentCount(databaseType);
    }

    public java.util.Map<String, Integer> getPolicyStatusCounts(DatabaseType database) {
        return policyService.getPolicyStatusCounts(database);
    }
}
