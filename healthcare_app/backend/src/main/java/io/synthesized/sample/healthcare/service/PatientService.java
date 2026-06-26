package io.synthesized.sample.healthcare.service;

import io.synthesized.sample.healthcare.model.Patient;
import io.synthesized.sample.healthcare.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Map<String, Object> getPatients(String database, int page, int size, String sortBy, String sortOrder,
                                          String searchQuery) {
        List<Patient> patients = patientRepository.findAll(database, page, size, sortBy, sortOrder, null, searchQuery, null);
        int totalCount = patientRepository.count(database, null, searchQuery, null);

        Map<String, Object> result = new HashMap<>();
        result.put("patients", patients);
        result.put("totalCount", totalCount);
        return result;
    }

    public Patient getPatient(String database, Long patientId) {
        return patientRepository.findById(database, patientId);
    }

    public Patient createPatient(String database, Patient patient) {
        return patientRepository.create(database, patient);
    }

    public List<Patient> getPatients(String database, int page, int size, String sortBy, String sortOrder,
                                     String bloodType, String searchQuery, String patientId) {
        return patientRepository.findAll(database, page, size, sortBy, sortOrder, bloodType, searchQuery, patientId);
    }

    public int count(String database, String bloodType, String searchQuery, String patientId) {
        return patientRepository.count(database, bloodType, searchQuery, patientId);
    }

    public Patient getPatientById(String database, Long patientId) {
        return patientRepository.findById(database, patientId);
    }

    public void deletePatient(String database, Long patientId) {
        patientRepository.deleteById(database, patientId);
    }
}
