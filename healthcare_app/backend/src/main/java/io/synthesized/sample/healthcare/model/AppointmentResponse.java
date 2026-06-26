package io.synthesized.sample.healthcare.model;

import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Paginated response for appointments.",
    example = "{\"appointments\": [{\"appointmentId\": 1, \"patientId\": 1, \"providerId\": 1, \"appointmentType\": \"Checkup\", \"status\": \"Scheduled\", \"appointmentDate\": \"2024-05-15T10:00:00\"}], \"totalCount\": 1}"
)
public class AppointmentResponse {
    @Schema(description = "List of appointments in the current page.")
    private List<Appointment> appointments;

    @Schema(description = "Total number of appointments matching the query.", example = "1")
    private long totalCount;

    public AppointmentResponse(List<Appointment> appointments, long totalCount) {
        this.appointments = appointments;
        this.totalCount = totalCount;
    }
}
