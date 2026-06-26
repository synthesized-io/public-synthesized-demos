package io.synthesized.sample.healthcare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import io.synthesized.sample.healthcare.model.Statistics;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.repository.StatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import io.synthesized.sample.healthcare.service.AppointmentService;

@Service
public class StatisticsService {
    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);

    private final StatisticsRepository statisticsRepository;
    @Autowired
    private AppointmentService appointmentService;

    public StatisticsService(StatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    public Statistics getStatistics(DatabaseType databaseType) {
        try {
            logger.info("Fetching statistics for database type: {}", databaseType);

            Statistics stats = new Statistics();

            try {
                stats.setTotalPrescriptions(statisticsRepository.getPrescriptionCount(databaseType));
                logger.debug("Total prescriptions: {}", stats.getTotalPrescriptions());
            } catch (Exception e) {
                logger.error("Error fetching prescriptions count: {}", e.getMessage(), e);
                throw e;
            }

            try {
                stats.setTotalPatients(statisticsRepository.getPatientCount(databaseType));
                logger.debug("Total patients: {}", stats.getTotalPatients());
            } catch (Exception e) {
                logger.error("Error fetching patients count: {}", e.getMessage(), e);
                throw e;
            }

            try {
                stats.setTotalAppointments(statisticsRepository.getAppointmentCount(databaseType));
                logger.debug("Total appointments: {}", stats.getTotalAppointments());
            } catch (Exception e) {
                logger.error("Error fetching appointments count: {}", e.getMessage(), e);
                throw e;
            }

            try {
                stats.setTotalProviders(statisticsRepository.getProviderCount(databaseType));
                logger.debug("Total providers: {}", stats.getTotalProviders());
            } catch (Exception e) {
                logger.error("Error fetching providers count: {}", e.getMessage(), e);
                throw e;
            }

            try {
                stats.setUpcomingAppointments(statisticsRepository.getUpcomingAppointmentCount(databaseType));
                logger.debug("Upcoming appointments: {}", stats.getUpcomingAppointments());
            } catch (Exception e) {
                logger.error("Error fetching upcoming appointments count: {}", e.getMessage(), e);
                throw e;
            }

            return stats;
        } catch (Exception e) {
            logger.error("Error getting statistics for database type {}: {}", databaseType, e.getMessage(), e);
            throw new RuntimeException("Failed to get statistics: " + e.getMessage(), e);
        }
    }

    public long getPrescriptionCount(DatabaseType databaseType) {
        return statisticsRepository.getPrescriptionCount(databaseType);
    }

    public long getPatientCount(DatabaseType databaseType) {
        return statisticsRepository.getPatientCount(databaseType);
    }

    public long getAppointmentCount(DatabaseType databaseType) {
        return statisticsRepository.getAppointmentCount(databaseType);
    }

    public long getProviderCount(DatabaseType databaseType) {
        return statisticsRepository.getProviderCount(databaseType);
    }

    public java.util.Map<String, Integer> getAppointmentStatusCounts(DatabaseType database) {
        return appointmentService.getAppointmentStatusCounts(database);
    }
}
