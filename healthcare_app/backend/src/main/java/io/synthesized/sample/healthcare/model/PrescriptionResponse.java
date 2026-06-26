package io.synthesized.sample.healthcare.model;

import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Paginated response for prescriptions.",
    example = "{\"prescriptions\": [{\"prescriptionId\": 1, \"appointmentId\": 1, \"medicationName\": \"Amoxicillin\", \"dosage\": \"500mg\", \"frequency\": \"Twice daily\"}], \"totalCount\": 1}"
)
public class PrescriptionResponse {
    @Schema(description = "List of prescriptions in the current page.")
    private List<Prescription> prescriptions;

    @Schema(description = "Total number of prescriptions matching the query.", example = "1")
    private long totalCount;

    public PrescriptionResponse(List<Prescription> prescriptions, long totalCount) {
        this.prescriptions = prescriptions;
        this.totalCount = totalCount;
    }
}
