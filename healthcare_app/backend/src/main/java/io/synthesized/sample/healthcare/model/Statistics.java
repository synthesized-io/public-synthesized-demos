package io.synthesized.sample.healthcare.model;

import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Summary statistics for the healthcare system, including totals for prescriptions, patients, appointments, and providers.",
    example = "{\"totalPrescriptions\": 500, \"totalPatients\": 100, \"totalAppointments\": 200, \"totalProviders\": 5}"
)
public class Statistics {
    @Schema(description = "Total number of prescriptions. Prescriptions belong to particular appointments.", example = "500")
    private long totalPrescriptions;

    @Schema(description = "Total number of patients.", example = "100")
    private long totalPatients;

    @Schema(description = "Total number of appointments. Appointments belong to particular patients.", example = "200")
    private long totalAppointments;

    @Schema(description = "Total number of providers.", example = "5")
    private long totalProviders;

    @Schema(description = "Number of upcoming appointments (scheduled appointments with future dates).", example = "50")
    private long upcomingAppointments;
}
