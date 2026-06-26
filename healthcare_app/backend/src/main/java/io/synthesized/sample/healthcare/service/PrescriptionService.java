package io.synthesized.sample.healthcare.service;

import io.synthesized.sample.healthcare.model.Prescription;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.model.PrescriptionResponse;
import io.synthesized.sample.healthcare.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;

    @Autowired
    public PrescriptionService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    public List<Prescription> getAllPrescriptions(DatabaseType databaseType) {
        return prescriptionRepository.findAll(databaseType);
    }

    public PrescriptionResponse getFilteredPrescriptions(
            DatabaseType databaseType,
            String medicationName,
            String appointmentId,
            String searchQuery,
            String sortBy,
            String sortOrder,
            int page,
            int size) {
        return prescriptionRepository.findByFilters(
            databaseType,
            medicationName,
            null,
            null,
            null,
            searchQuery,
            sortBy,
            sortOrder,
            page,
            size,
            appointmentId
        );
    }

    public Prescription createPrescription(Prescription prescription, DatabaseType databaseType) {
        return prescriptionRepository.create(prescription, databaseType);
    }

    public PrescriptionResponse getPrescriptionsByFilters(
            DatabaseType databaseType,
            String medicationName,
            String prescriptionId,
            String patientId,
            String providerId,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size,
            String appointmentIds) {
        return prescriptionRepository.findByFilters(
            databaseType,
            medicationName,
            prescriptionId,
            patientId,
            providerId,
            search,
            sortBy,
            sortOrder,
            page,
            size,
            appointmentIds
        );
    }

    public void deletePrescription(Long prescriptionId, DatabaseType databaseType) {
        prescriptionRepository.deleteById(prescriptionId, databaseType);
    }
}
