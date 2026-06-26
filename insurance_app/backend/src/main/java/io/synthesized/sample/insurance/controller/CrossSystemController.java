package io.synthesized.sample.insurance.controller;

import io.synthesized.sample.insurance.service.CrossSystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/cross-system")
@CrossOrigin(origins = "*")
@Tag(name = "Cross-System Integration", description = "APIs for querying cross-system data between Insurance and Healthcare")
public class CrossSystemController {

    private final CrossSystemService crossSystemService;

    @Autowired
    public CrossSystemController(CrossSystemService crossSystemService) {
        this.crossSystemService = crossSystemService;
    }

    @Operation(
        summary = "Get healthcare information for a policy",
        description = "Retrieves healthcare patient information linked to a specific insurance policy. Demonstrates cross-system referential integrity between Insurance and Healthcare systems.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Healthcare information retrieved successfully"
            )
        }
    )
    @GetMapping("/policy/{policyId}/healthcare")
    public ResponseEntity<List<Map<String, Object>>> getHealthcareInfoForPolicy(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Insurance policy ID", required = true)
            @PathVariable Integer policyId) {
        List<Map<String, Object>> healthcareInfo = crossSystemService.getHealthcareInfoForPolicy(database, policyId);
        return ResponseEntity.ok(healthcareInfo);
    }

    @Operation(
        summary = "Get all policies with healthcare links",
        description = "Retrieves all insurance policies that have linked healthcare patients. Shows the count of patients associated with each policy.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policies with healthcare links retrieved successfully"
            )
        }
    )
    @GetMapping("/policies-with-healthcare-links")
    public ResponseEntity<List<Map<String, Object>>> getPoliciesWithHealthcareLinks(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        List<Map<String, Object>> policies = crossSystemService.getPoliciesWithHealthcareLinks(database);
        return ResponseEntity.ok(policies);
    }
}
