package io.synthesized.sample.insurance.controller;

import io.synthesized.sample.insurance.model.Policy;
import io.synthesized.sample.insurance.model.PolicyResponse;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.service.PolicyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.synthesized.sample.insurance.model.ErrorResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = "*")
@Tag(name = "Policy Management", description = "APIs for managing insurance policies")
public class PolicyController {
    private static final Logger logger = LoggerFactory.getLogger(PolicyController.class);
    private final PolicyService policyService;

    @Autowired
    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @Operation(
        summary = "Get policies with filters",
        description = "Retrieves a paginated list of policies with optional filters for policy type, status, policyId, and search query. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policies retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PolicyResponse.class),
                    examples = @ExampleObject(value = "{\"policies\": [{\"policyId\": 1, \"policyholderId\": 1, \"policyType\": \"Auto\", \"status\": \"Active\", \"coverageAmount\": 50000.00}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve policies\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<?> getPolicies(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") DatabaseType database,
            @Parameter(description = "Page number for pagination", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size for pagination", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(
                description = "Field to sort by. Allowed values: policy_id, policyholder_id, policy_type, status, coverage_amount.",
                example = "policy_id",
                schema = @Schema(allowableValues = {"policy_id", "policyholder_id", "policy_type", "status", "coverage_amount"})
            )
            @RequestParam(defaultValue = "policy_id") String sortBy,
            @Parameter(
                description = "Sort order (asc or desc)",
                example = "asc",
                required = false,
                schema = @Schema(allowableValues = {"asc", "desc"})
            )
            @RequestParam(defaultValue = "asc", required = false) String sortOrder,
            @Parameter(
                description = "Filter by policy type. Allowed values: Auto, Home, Life, Health, Travel.",
                required = false,
                schema = @Schema(allowableValues = {"Auto", "Home", "Life", "Health", "Travel"})
            )
            @RequestParam(required = false) String policyType,
            @Parameter(
                description = "Filter by policy status. Allowed values: Active, Expired, Cancelled, Pending, Suspended.",
                required = false,
                schema = @Schema(allowableValues = {"Active", "Expired", "Cancelled", "Pending", "Suspended"})
            )
            @RequestParam(required = false) String status,
            @Parameter(description = "Filter by policy ID", required = false)
            @RequestParam(required = false) String policyId,
            @Parameter(description = "Search query for policy number or other fields", required = false)
            @RequestParam(required = false, name = "searchQuery") String search) {
        try {
            logger.info("Getting policies with filters - database: {}, page: {}, size: {}, sortBy: {}, sortOrder: {}, policyType: {}, status: {}, policyId: {}, search: '{}'",
                    database, page, size, sortBy, sortOrder, policyType, status, policyId, search);
            PolicyResponse response = policyService.getPoliciesByFilters(
                database, page, size, sortBy, sortOrder, policyType, status, policyId, search);
            logger.info("Found {} policies", response.getTotalCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting policies", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @Operation(
        summary = "Create a new policy",
        description = "Creates a new policy with the provided policy details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Policy object to create. Do not include policyId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Policy.class),
                examples = @ExampleObject(value = "{\"policyholderId\": 1, \"policyType\": \"Auto\", \"status\": \"Active\", \"coverageAmount\": 50000.00}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policy created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Policy.class),
                    examples = @ExampleObject(value = "{\"policyId\": 1, \"policyholderId\": 1, \"policyType\": \"Auto\", \"status\": \"Active\", \"coverageAmount\": 50000.00}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid policy data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid policy type\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create policy\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createPolicy(
            @RequestBody Policy policy,
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        try {
            logger.info("Creating new policy in database: {} with data: {}", database, policy);
            DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
            Policy createdPolicy = policyService.createPolicy(policy, databaseType);
            logger.info("Successfully created policy with ID: {}", createdPolicy.getPolicyId());
            return ResponseEntity.ok(createdPolicy);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid policy data: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error creating policy: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An error occurred while creating the policy: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Update policy status",
        description = "Updates the status of an existing policy.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Policy object containing the new status. Only the status field is used.",
            content = @Content(
                schema = @Schema(implementation = Policy.class),
                examples = @ExampleObject(value = "{\"status\": \"Suspended\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policy status updated successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Policy.class),
                    examples = @ExampleObject(value = "{\"policyId\": 1, \"policyholderId\": 1, \"policyType\": \"Auto\", \"status\": \"Suspended\", \"coverageAmount\": 50000.00}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid policy data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid status\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to update policy status\"}")
                )
            )
        }
    )
    @PatchMapping("/{policyId}")
    public ResponseEntity<?> updatePolicyStatus(
            @Parameter(description = "ID of the policy to update", required = true, example = "1")
            @PathVariable Long policyId,
            @RequestBody Policy policy,
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        try {
            logger.info("Updating policy status in database: {} for policy ID: {} with status: {}",
                database, policyId, policy.getStatus());
            DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
            Policy updatedPolicy = policyService.updatePolicyStatus(policyId, policy.getStatus(), databaseType);
            logger.info("Successfully updated policy status for ID: {}", policyId);
            return ResponseEntity.ok(updatedPolicy);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid policy data: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error updating policy status: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An error occurred while updating the policy status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Delete a policy",
        description = "Deletes a policy by its ID. Also deletes related claims.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policy deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Policy deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid policy ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete policy\"}")
                )
            )
        }
    )
    @DeleteMapping("/{policyId}")
    public ResponseEntity<?> deletePolicy(
        @Parameter(description = "ID of the policy to delete", required = true, example = "1")
        @PathVariable Long policyId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            policyService.deletePolicy(policyId, database);
            return ResponseEntity.ok(Map.of("message", "Policy deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete policy: " + e.getMessage()));
        }
    }
}
