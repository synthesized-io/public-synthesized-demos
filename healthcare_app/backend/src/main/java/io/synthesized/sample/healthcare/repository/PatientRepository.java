package io.synthesized.sample.healthcare.repository;

import io.synthesized.sample.healthcare.model.Patient;
import io.synthesized.sample.healthcare.model.DatabaseType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.sql.Array;
import java.util.stream.Collectors;

@Repository
public class PatientRepository {

    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public PatientRepository(
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

    private final RowMapper<Patient> patientRowMapper = (rs, rowNum) -> {
        Patient patient = new Patient();
        patient.setPatientId(rs.getLong("patient_id"));
        patient.setFirstName(rs.getString("first_name"));
        patient.setLastName(rs.getString("last_name"));
        patient.setEmail(rs.getString("email"));
        patient.setPhone(rs.getString("phone"));
        java.sql.Date dateOfBirth = rs.getDate("date_of_birth");
        patient.setDateOfBirth(dateOfBirth != null ? dateOfBirth.toLocalDate() : null);
        patient.setBloodType(rs.getString("blood_type"));
        java.sql.Timestamp createdAt = rs.getTimestamp("created_at");
        patient.setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null);
        patient.setMedicalRecordNumber(rs.getString("medical_record_number"));
        patient.setPatientType(rs.getString("patient_type"));
        Integer insurancePolicyId = (Integer) rs.getObject("insurance_policy_id");
        patient.setInsurancePolicyId(insurancePolicyId != null ? insurancePolicyId.longValue() : null);
        return patient;
    };

    public List<Patient> findAll(String database, int page, int size, String sortBy, String sortOrder,
                                String bloodType, String searchQuery, String patientId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        StringBuilder sql = new StringBuilder(
            "SELECT p.*, array_agg(a.appointment_id) as appointment_ids " +
            "FROM healthcare.patients p " +
            "LEFT JOIN healthcare.appointments a ON p.patient_id = a.patient_id " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (bloodType != null && !bloodType.isEmpty()) {
            sql.append(" AND p.blood_type = ?::healthcare.blood_type_enum");
            params.add(bloodType);
        }
        if (patientId != null && !patientId.isEmpty()) {
            sql.append(" AND p.patient_id = ?");
            params.add(Long.parseLong(patientId));
        } else if (searchQuery != null && !searchQuery.isEmpty()) {
            sql.append(" AND (LOWER(p.first_name) LIKE LOWER(?) OR LOWER(p.last_name) LIKE LOWER(?) OR LOWER(p.email) LIKE LOWER(?))");
            String q = "%" + searchQuery + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }
        sql.append(" GROUP BY p.patient_id, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth, p.blood_type, p.created_at, p.medical_record_number, p.patient_type, p.insurance_policy_id");
        sql.append(" ORDER BY p.").append(sortBy).append(" ").append(sortOrder);
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return getJdbcTemplate(databaseType).query(sql.toString(), (rs, rowNum) -> {
            Patient patient = patientRowMapper.mapRow(rs, rowNum);
            Array appointmentIdsArray = rs.getArray("appointment_ids");
            if (appointmentIdsArray != null) {
                Object[] appointmentIdsObj = (Object[]) appointmentIdsArray.getArray();
                patient.setAppointmentIds(Arrays.stream(appointmentIdsObj)
                    .filter(id -> id != null)
                    .map(id -> id instanceof Integer ? ((Integer) id).longValue() : (Long) id)
                    .collect(Collectors.toList()));
            } else {
                patient.setAppointmentIds(new ArrayList<>());
            }
            return patient;
        }, params.toArray());
    }

    public int count(String database, String bloodType, String searchQuery, String patientId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        StringBuilder sql = new StringBuilder(
            "SELECT COUNT(DISTINCT p.patient_id) " +
            "FROM healthcare.patients p " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (bloodType != null && !bloodType.isEmpty()) {
            sql.append(" AND p.blood_type = ?::healthcare.blood_type_enum");
            params.add(bloodType);
        }
        if (patientId != null && !patientId.isEmpty()) {
            sql.append(" AND p.patient_id = ?");
            params.add(Long.parseLong(patientId));
        } else if (searchQuery != null && !searchQuery.isEmpty()) {
            sql.append(" AND (LOWER(p.first_name) LIKE LOWER(?) OR LOWER(p.last_name) LIKE LOWER(?) OR LOWER(p.email) LIKE LOWER(?))");
            String q = "%" + searchQuery + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }

        return getJdbcTemplate(databaseType).queryForObject(sql.toString(), params.toArray(), Integer.class);
    }

    public Patient findById(String database, Long patientId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        String sql =
            "SELECT p.*, array_agg(a.appointment_id) as appointment_ids " +
            "FROM healthcare.patients p " +
            "LEFT JOIN healthcare.appointments a ON p.patient_id = a.patient_id " +
            "WHERE p.patient_id = ? " +
            "GROUP BY p.patient_id, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth, p.blood_type, p.created_at, p.medical_record_number, p.patient_type, p.insurance_policy_id";

        return getJdbcTemplate(databaseType).queryForObject(sql, (rs, rowNum) -> {
            Patient patient = patientRowMapper.mapRow(rs, rowNum);
            Array appointmentIdsArray = rs.getArray("appointment_ids");
            if (appointmentIdsArray != null) {
                Object[] appointmentIdsObj = (Object[]) appointmentIdsArray.getArray();
                patient.setAppointmentIds(Arrays.stream(appointmentIdsObj)
                    .filter(id -> id != null)
                    .map(id -> id instanceof Integer ? ((Integer) id).longValue() : (Long) id)
                    .collect(Collectors.toList()));
            } else {
                patient.setAppointmentIds(new ArrayList<>());
            }
            return patient;
        }, patientId);
    }

    public Patient create(String database, Patient patient) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());

        // Generate a unique medical record number if not provided
        String medicalRecordNumber = patient.getMedicalRecordNumber();
        if (medicalRecordNumber == null || medicalRecordNumber.isEmpty()) {
            medicalRecordNumber = "MRN-" + System.currentTimeMillis();
        }

        // Set default patient type if not provided
        String patientType = patient.getPatientType();
        if (patientType == null || patientType.isEmpty()) {
            patientType = "Adult";
        }

        String sql = "INSERT INTO healthcare.patients (first_name, last_name, email, phone, date_of_birth, blood_type, patient_type, medical_record_number, insurance_policy_id) " +
                "VALUES (?, ?, ?, ?, ?, ?::healthcare.blood_type_enum, ?::healthcare.patient_type_enum, ?, ?) RETURNING *";

        return getJdbcTemplate(databaseType).queryForObject(sql, patientRowMapper,
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getDateOfBirth(),
                patient.getBloodType(),
                patientType,
                medicalRecordNumber,
                patient.getInsurancePolicyId());
    }

    public void deleteById(String database, Long patientId) {
        DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
        // Get all appointment IDs for this patient
        List<Long> appointmentIds = getJdbcTemplate(databaseType).query(
            "SELECT appointment_id FROM healthcare.appointments WHERE patient_id = ?",
            (rs, rowNum) -> rs.getLong("appointment_id"),
            patientId
        );
        for (Long appointmentId : appointmentIds) {
            // Delete related prescriptions
            getJdbcTemplate(databaseType).update(
                "DELETE FROM healthcare.prescriptions WHERE appointment_id = ?",
                appointmentId
            );
            // Delete the appointment
            getJdbcTemplate(databaseType).update(
                "DELETE FROM healthcare.appointments WHERE appointment_id = ?",
                appointmentId
            );
        }
        // Finally, delete the patient
        getJdbcTemplate(databaseType).update(
            "DELETE FROM healthcare.patients WHERE patient_id = ?",
            patientId
        );
    }
}
