package io.synthesized.sample.insurance.model;

import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Summary statistics for the insurance company, including totals for claims, policyholders, policies, and agents.",
    example = "{\"totalClaims\": 500, \"totalPolicyholders\": 100, \"totalPolicies\": 200, \"totalAgents\": 5}"
)
public class Statistics {
    @Schema(description = "Total number of claims. Claims belong to particular policies.", example = "500")
    private long totalClaims;

    @Schema(description = "Total number of policyholders.", example = "100")
    private long totalPolicyholders;

    @Schema(description = "Total number of policies. Policies belong to particular policyholders.", example = "200")
    private long totalPolicies;

    @Schema(description = "Total number of agents.", example = "5")
    private long totalAgents;
}
