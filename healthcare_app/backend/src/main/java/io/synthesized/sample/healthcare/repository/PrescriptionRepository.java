package io.synthesized.sample.healthcare.repository;

import io.synthesized.sample.healthcare.model.Prescription;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.model.PrescriptionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.ArrayList;

@Repository
public class PrescriptionRepository {
    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public PrescriptionRepository(
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

    private final RowMapper<Prescription> prescriptionRowMapper = (rs, rowNum) -> {
        Prescription prescription = new Prescription();
        prescription.setPrescriptionId(rs.getLong("prescription_id"));
        prescription.setAppointmentId(rs.getLong("appointment_id"));
        prescription.setPatientId(rs.getLong("patient_id"));
        prescription.setProviderId(rs.getLong("provider_id"));
        prescription.setMedicationName(rs.getString("medication_name"));
        prescription.setDosage(rs.getString("dosage"));
        prescription.setFrequency(rs.getString("frequency"));
        java.sql.Date startDate = rs.getDate("start_date");
        prescription.setStartDate(startDate != null ? startDate.toLocalDate() : null);
        java.sql.Date endDate = rs.getDate("end_date");
        prescription.setEndDate(endDate != null ? endDate.toLocalDate() : null);
        prescription.setInstructions(rs.getString("instructions"));
        return prescription;
    };

    public List<Prescription> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            """
            SELECT prescription_id, appointment_id, patient_id, provider_id, medication_name, dosage, frequency, start_date, end_date, instructions
            FROM healthcare.prescriptions
            ORDER BY prescription_id
            """,
            prescriptionRowMapper
        );
    }

    public PrescriptionResponse findByFilters(
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

        StringBuilder countQuery = new StringBuilder(
            """
            SELECT COUNT(*)
            FROM healthcare.prescriptions
            WHERE 1=1
            """
        );

        StringBuilder dataQuery = new StringBuilder(
            """
            SELECT prescription_id, appointment_id, patient_id, provider_id, medication_name, dosage, frequency, start_date, end_date, instructions
            FROM healthcare.prescriptions
            WHERE 1=1
            """
        );

        List<Object> params = new ArrayList<>();

        if (medicationName != null && !medicationName.isEmpty()) {
            countQuery.append(" AND LOWER(medication_name) LIKE LOWER(?)");
            dataQuery.append(" AND LOWER(medication_name) LIKE LOWER(?)");
            params.add("%" + medicationName + "%");
        }

        if (prescriptionId != null && !prescriptionId.isEmpty()) {
            countQuery.append(" AND prescription_id = ?");
            dataQuery.append(" AND prescription_id = ?");
            params.add(Long.parseLong(prescriptionId));
        }

        if (patientId != null && !patientId.isEmpty()) {
            countQuery.append(" AND patient_id = ?");
            dataQuery.append(" AND patient_id = ?");
            params.add(Long.parseLong(patientId));
        }

        if (providerId != null && !providerId.isEmpty()) {
            countQuery.append(" AND provider_id = ?");
            dataQuery.append(" AND provider_id = ?");
            params.add(Long.parseLong(providerId));
        }

        if (appointmentIds != null && !appointmentIds.isEmpty()) {
            String[] ids = appointmentIds.split(",");
            if (ids.length > 0) {
                countQuery.append(" AND appointment_id IN (");
                dataQuery.append(" AND appointment_id IN (");
                for (int i = 0; i < ids.length; i++) {
                    if (i > 0) {
                        countQuery.append(",");
                        dataQuery.append(",");
                    }
                    countQuery.append("?");
                    dataQuery.append("?");
                    params.add(Long.parseLong(ids[i].trim()));
                }
                countQuery.append(")");
                dataQuery.append(")");
            }
        }

        if (search != null && !search.isEmpty()) {
            // Try to parse as prescription ID first
            try {
                Long searchId = Long.parseLong(search);
                countQuery.append(" AND prescription_id = ?");
                dataQuery.append(" AND prescription_id = ?");
                params.add(searchId);
            } catch (NumberFormatException e) {
                // If not a number, search in other fields
                String searchPattern = "%" + search.toLowerCase() + "%";
                countQuery.append(" AND (LOWER(medication_name) LIKE ? OR LOWER(dosage) LIKE ? OR LOWER(frequency::text) LIKE ? OR LOWER(instructions) LIKE ?)");
                dataQuery.append(" AND (LOWER(medication_name) LIKE ? OR LOWER(dosage) LIKE ? OR LOWER(frequency::text) LIKE ? OR LOWER(instructions) LIKE ?)");
                // Add search pattern for each field
                for (int i = 0; i < 4; i++) {
                    params.add(searchPattern);
                }
            }
        }

        // Add sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            dataQuery.append(" ORDER BY ").append(sortBy).append(" ").append(sortOrder);
        } else {
            dataQuery.append(" ORDER BY prescription_id ").append(sortOrder);
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
        List<Prescription> prescriptions = getJdbcTemplate(databaseType).query(
            dataQuery.toString(),
            prescriptionRowMapper,
            params.toArray()
        );

        return new PrescriptionResponse(prescriptions, totalCount);
    }

    public Prescription create(Prescription prescription, DatabaseType databaseType) {
        // Validate required fields
        if (prescription.getAppointmentId() == null) {
            throw new IllegalArgumentException("Appointment ID is required");
        }
        if (prescription.getMedicationName() == null || prescription.getMedicationName().trim().isEmpty()) {
            throw new IllegalArgumentException("Medication Name is required");
        }
        if (prescription.getFrequency() == null || prescription.getFrequency().trim().isEmpty()) {
            throw new IllegalArgumentException("Frequency is required");
        }

        // Get the next available prescription ID
        Long nextId = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT COALESCE(MAX(prescription_id), 0) + 1
            FROM healthcare.prescriptions
            """,
            Long.class
        );

        // Insert with the generated ID
        getJdbcTemplate(databaseType).update(
            """
            INSERT INTO healthcare.prescriptions (
                prescription_id, appointment_id, patient_id, provider_id, medication_name, dosage, frequency, start_date, end_date, instructions
            ) VALUES (?, ?, ?, ?, ?, ?, ?::healthcare.frequency_enum, ?, ?, ?)
            """,
            nextId,
            prescription.getAppointmentId(),
            prescription.getPatientId(),
            prescription.getProviderId(),
            prescription.getMedicationName(),
            prescription.getDosage(),
            prescription.getFrequency(),
            prescription.getStartDate(),
            prescription.getEndDate(),
            prescription.getInstructions()
        );

        prescription.setPrescriptionId(nextId);
        return prescription;
    }

    public void deleteById(Long prescriptionId, DatabaseType databaseType) {
        getJdbcTemplate(databaseType).update(
            "DELETE FROM healthcare.prescriptions WHERE prescription_id = ?",
            prescriptionId
        );
    }
}
