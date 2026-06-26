package io.synthesized.sample.healthcare.repository;

import io.synthesized.sample.healthcare.model.Appointment;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.model.AppointmentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.ArrayList;

@Repository
public class AppointmentRepository {
    private final JdbcTemplate seedJdbcTemplate;
    private final JdbcTemplate testingJdbcTemplate;
    private final JdbcTemplate prodJdbcTemplate;

    @Autowired
    public AppointmentRepository(
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

    private final RowMapper<Appointment> appointmentRowMapper = (rs, rowNum) -> {
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(rs.getLong("appointment_id"));
        appointment.setPatientId(rs.getLong("patient_id"));
        appointment.setPatientFirstName(rs.getString("patient_first_name"));
        appointment.setPatientLastName(rs.getString("patient_last_name"));
        Integer providerIdInt = rs.getObject("provider_id", Integer.class);
        appointment.setProviderId(providerIdInt != null ? providerIdInt.longValue() : null);
        appointment.setProviderName(rs.getString("provider_name"));
        appointment.setAppointmentType(rs.getString("appointment_type"));
        appointment.setStatus(rs.getString("appointment_status"));
        java.sql.Timestamp appointmentDate = rs.getTimestamp("appointment_date");
        appointment.setAppointmentDate(appointmentDate != null ? appointmentDate.toLocalDateTime() : null);
        appointment.setDuration(rs.getInt("duration_minutes"));
        appointment.setDepartment(rs.getString("department"));
        return appointment;
    };

    public List<Appointment> findAll(DatabaseType databaseType) {
        return getJdbcTemplate(databaseType).query(
            """
            SELECT a.appointment_id, a.patient_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name, a.provider_id, a.provider_name, a.appointment_type, a.appointment_status, a.appointment_date, a.duration_minutes, a.department
            FROM healthcare.appointments a
            LEFT JOIN healthcare.patients p ON a.patient_id = p.patient_id
            ORDER BY a.appointment_id ASC
            """,
            appointmentRowMapper
        );
    }

    public AppointmentResponse findByFilters(
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

        StringBuilder countQuery = new StringBuilder(
            """
            SELECT COUNT(*)
            FROM healthcare.appointments a
            LEFT JOIN healthcare.patients p ON a.patient_id = p.patient_id
            WHERE 1=1
            """
        );

        StringBuilder dataQuery = new StringBuilder(
            """
            SELECT a.appointment_id, a.patient_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name, a.provider_id, a.provider_name, a.appointment_type, a.appointment_status, a.appointment_date, a.duration_minutes, a.department
            FROM healthcare.appointments a
            LEFT JOIN healthcare.patients p ON a.patient_id = p.patient_id
            WHERE 1=1
            """
        );

        List<Object> params = new ArrayList<>();

        // Date range filters
        if (fromDate != null && !fromDate.isEmpty()) {
            countQuery.append(" AND a.appointment_date >= ?::timestamp");
            dataQuery.append(" AND a.appointment_date >= ?::timestamp");
            params.add(fromDate);
        }

        if (toDate != null && !toDate.isEmpty()) {
            countQuery.append(" AND a.appointment_date < ?::timestamp");
            dataQuery.append(" AND a.appointment_date < ?::timestamp");
            params.add(toDate);
        }

        if (appointmentType != null && !appointmentType.isEmpty()) {
            countQuery.append(" AND a.appointment_type = ?::healthcare.appointment_type_enum");
            dataQuery.append(" AND a.appointment_type = ?::healthcare.appointment_type_enum");
            params.add(appointmentType);
        }

        if (status != null && !status.isEmpty()) {
            countQuery.append(" AND a.appointment_status = ?::healthcare.appointment_status_enum");
            dataQuery.append(" AND a.appointment_status = ?::healthcare.appointment_status_enum");
            params.add(status);
        }

        if (appointmentId != null && !appointmentId.isEmpty()) {
            countQuery.append(" AND a.appointment_id = ?");
            dataQuery.append(" AND a.appointment_id = ?");
            params.add(Long.parseLong(appointmentId));
        }

        if (patientId != null && !patientId.isEmpty()) {
            countQuery.append(" AND a.patient_id = ?");
            dataQuery.append(" AND a.patient_id = ?");
            params.add(Long.parseLong(patientId));
        }

        if (providerId != null && !providerId.isEmpty()) {
            countQuery.append(" AND a.provider_id = ?");
            dataQuery.append(" AND a.provider_id = ?");
            params.add(Long.parseLong(providerId));
        }

        if (search != null && !search.isEmpty()) {
            // Try to parse as appointment ID first
            try {
                Long searchAppointmentId = Long.parseLong(search);
                countQuery.append(" AND a.appointment_id = ?");
                dataQuery.append(" AND a.appointment_id = ?");
                params.add(searchAppointmentId);
            } catch (NumberFormatException e) {
                // If not a number, search in other fields
                String searchPattern = "%" + search.toLowerCase() + "%";
                countQuery.append(" AND (LOWER(CAST(a.appointment_id AS TEXT)) LIKE ? OR LOWER(a.appointment_type::text) LIKE ? OR LOWER(a.appointment_status::text) LIKE ? OR LOWER(a.provider_name) LIKE ? OR LOWER(p.first_name) LIKE ? OR LOWER(p.last_name) LIKE ? OR LOWER(a.department::text) LIKE ?)");
                dataQuery.append(" AND (LOWER(CAST(a.appointment_id AS TEXT)) LIKE ? OR LOWER(a.appointment_type::text) LIKE ? OR LOWER(a.appointment_status::text) LIKE ? OR LOWER(a.provider_name) LIKE ? OR LOWER(p.first_name) LIKE ? OR LOWER(p.last_name) LIKE ? OR LOWER(a.department::text) LIKE ?)");
                // Add search pattern for each field
                for (int i = 0; i < 7; i++) {
                    params.add(searchPattern);
                }
            }
        }

        // Add sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            dataQuery.append(" ORDER BY a.").append(sortBy).append(" ").append(sortOrder);
        } else {
            dataQuery.append(" ORDER BY a.appointment_id ").append(sortOrder);
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
        List<Appointment> appointments = getJdbcTemplate(databaseType).query(
            dataQuery.toString(),
            appointmentRowMapper,
            params.toArray()
        );

        return new AppointmentResponse(appointments, totalCount);
    }

    public Appointment create(Appointment appointment, DatabaseType databaseType) {
        // Validate required fields
        if (appointment.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        if (appointment.getAppointmentType() == null || appointment.getAppointmentType().trim().isEmpty()) {
            throw new IllegalArgumentException("Appointment Type is required");
        }
        if (appointment.getStatus() == null || appointment.getStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        // Get the next available appointment ID
        Long nextId = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT COALESCE(MAX(appointment_id), 0) + 1
            FROM healthcare.appointments
            """,
            Long.class
        );

        // Insert with the generated ID
        getJdbcTemplate(databaseType).update(
            """
            INSERT INTO healthcare.appointments (
                appointment_id, patient_id, provider_name, appointment_type, appointment_status, appointment_date, duration_minutes, department, appointment_number
            ) VALUES (?, ?, ?, ?::healthcare.appointment_type_enum, ?::healthcare.appointment_status_enum, ?, ?, ?::healthcare.department_enum, ?)
            """,
            nextId,
            appointment.getPatientId(),
            appointment.getProviderName(),
            appointment.getAppointmentType(),
            appointment.getStatus(),
            appointment.getAppointmentDate(),
            appointment.getDuration(),
            appointment.getDepartment(),
            "APT-" + nextId
        );

        appointment.setAppointmentId(nextId);
        return appointment;
    }

    public Appointment updateStatus(Long appointmentId, String status, DatabaseType databaseType) {
        // Validate appointment exists
        Appointment existingAppointment = getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT a.appointment_id, a.patient_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name, a.provider_id, a.provider_name, a.appointment_type, a.appointment_status, a.appointment_date, a.duration_minutes, a.department
            FROM healthcare.appointments a
            LEFT JOIN healthcare.patients p ON a.patient_id = p.patient_id
            WHERE a.appointment_id = ?
            """,
            appointmentRowMapper,
            appointmentId
        );

        if (existingAppointment == null) {
            throw new IllegalArgumentException("Appointment not found with ID: " + appointmentId);
        }

        // Update status
        getJdbcTemplate(databaseType).update(
            """
            UPDATE healthcare.appointments
            SET appointment_status = ?::healthcare.appointment_status_enum
            WHERE appointment_id = ?
            """,
            status, appointmentId
        );

        // Return updated appointment
        return getJdbcTemplate(databaseType).queryForObject(
            """
            SELECT a.appointment_id, a.patient_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name, a.provider_id, a.provider_name, a.appointment_type, a.appointment_status, a.appointment_date, a.duration_minutes, a.department
            FROM healthcare.appointments a
            LEFT JOIN healthcare.patients p ON a.patient_id = p.patient_id
            WHERE a.appointment_id = ?
            """,
            appointmentRowMapper,
            appointmentId
        );
    }

    public java.util.Map<String, Integer> countAppointmentsByStatus(DatabaseType databaseType) {
        String sql = "SELECT appointment_status, COUNT(*) as count FROM healthcare.appointments GROUP BY appointment_status";
        return getJdbcTemplate(databaseType).query(sql, rs -> {
            java.util.Map<String, Integer> result = new java.util.HashMap<>();
            while (rs.next()) {
                result.put(rs.getString("appointment_status"), rs.getInt("count"));
            }
            return result;
        });
    }

    public void deleteById(Long appointmentId, DatabaseType databaseType) {
        // Delete related prescriptions
        getJdbcTemplate(databaseType).update(
            "DELETE FROM healthcare.prescriptions WHERE appointment_id = ?",
            appointmentId
        );
        // Then delete the appointment
        getJdbcTemplate(databaseType).update(
            "DELETE FROM healthcare.appointments WHERE appointment_id = ?",
            appointmentId
        );
    }
}
