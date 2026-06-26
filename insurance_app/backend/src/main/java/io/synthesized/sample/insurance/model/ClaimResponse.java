package io.synthesized.sample.insurance.model;

import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Paginated response for claims.",
    example = "{\"claims\": [{\"claimId\": 1, \"policyId\": 1, \"claimNumber\": \"CLM-12345\", \"claimType\": \"Accident\", \"claimStatus\": \"Pending\", \"filedDate\": \"2024-05-01\", \"incidentDate\": \"2024-04-28\", \"claimAmount\": 5000.00}], \"totalCount\": 1}"
)
public class ClaimResponse {
    @Schema(description = "List of claims in the current page.")
    private List<Claim> claims;

    @Schema(description = "Total number of claims matching the query.", example = "1")
    private long totalCount;

    public ClaimResponse(List<Claim> claims, long totalCount) {
        this.claims = claims;
        this.totalCount = totalCount;
    }
}
