package io.synthesized.sample.insurance.model;

import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Paginated response for policies.",
    example = "{\"policies\": [{\"policyId\": 1, \"policyholderId\": 1, \"policyNumber\": \"POL-12345\", \"policyType\": \"Auto\", \"status\": \"Active\", \"coverageAmount\": 50000.00, \"premiumAmount\": 1200.00}], \"totalCount\": 1}"
)
public class PolicyResponse {
    @Schema(description = "List of policies in the current page.")
    private List<Policy> policies;

    @Schema(description = "Total number of policies matching the query.", example = "1")
    private long totalCount;

    public PolicyResponse(List<Policy> policies, long totalCount) {
        this.policies = policies;
        this.totalCount = totalCount;
    }
}
