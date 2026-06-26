package io.synthesized.sample.healthcare.service;

import io.synthesized.sample.healthcare.model.Appointment;
import io.synthesized.sample.healthcare.model.AppointmentResponse;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public AppointmentResponse getAppointmentsByFilters(
            DatabaseType databaseType,
            int page,
            int size,
            String sortBy,
            String sortOrder,
            String appointmentType,
            String status,
            String appointmentId,
            String patientId,
            String providerId,
            String search,
            String fromDate,
            String toDate) {
        return appointmentRepository.findByFilters(databaseType, page, size, sortBy, sortOrder, appointmentType, status, appointmentId, patientId, providerId, search, fromDate, toDate);
    }

    public Appointment createAppointment(Appointment appointment, DatabaseType databaseType) {
        return appointmentRepository.create(appointment, databaseType);
    }

    public Appointment updateAppointmentStatus(Long appointmentId, String status, DatabaseType databaseType) {
        // Validate status
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        return appointmentRepository.updateStatus(appointmentId, status, databaseType);
    }

    public java.util.Map<String, Integer> getAppointmentStatusCounts(DatabaseType databaseType) {
        return appointmentRepository.countAppointmentsByStatus(databaseType);
    }

    public void deleteAppointment(Long appointmentId, DatabaseType databaseType) {
        appointmentRepository.deleteById(appointmentId, databaseType);
    }
}
