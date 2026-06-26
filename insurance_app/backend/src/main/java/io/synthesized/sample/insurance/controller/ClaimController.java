package io.synthesized.sample.insurance.controller;

import io.synthesized.sample.insurance.model.Claim;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.model.ClaimResponse;
import io.synthesized.sample.insurance.model.ErrorResponse;
import io.synthesized.sample.insurance.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/claims")
@Tag(name = "Claim Management", description = "APIs for managing insurance claims")
@CrossOrigin(origins = "*")
public class ClaimController {
    private final ClaimService claimService;
    private static final Logger log = LoggerFactory.getLogger(ClaimController.class);

    @Autowired
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @Operation(
        summary = "Get claims with filters",
        description = "Retrieves a paginated list of claims with optional filters for claim type, claimId, search query, and policyIds. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Claims retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ClaimResponse.class),
                    examples = @ExampleObject(value = "{\"claims\": [{\"claimId\": 1, \"policyId\": 1, \"claimType\": \"Accident\", \"claimStatus\": \"Pending\", \"filedDate\": \"2024-05-01\", \"claimAmount\": 5000.00}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve claims\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<?> getClaims(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database,
        @Parameter(
            description = "Filter by claim type. Allowed values: Accident, Theft, Damage, Medical, Liability.",
            required = false,
            schema = @Schema(allowableValues = {"Accident", "Theft", "Damage", "Medical", "Liability"})
        )
        @RequestParam(required = false) String claimType,
        @Parameter(
            description = "Filter by claim status. Allowed values: Draft, Open, Closed.",
            required = false,
            schema = @Schema(allowableValues = {"Draft", "Open", "Closed"})
        )
        @RequestParam(required = false) String status,
        @Parameter(description = "Filter by claim ID", required = false)
        @RequestParam(required = false) String claimId,
        @Parameter(description = "Search query for claim details", required = false)
        @RequestParam(required = false) String searchQuery,
        @Parameter(
            description = "Field to sort by. Allowed values: claim_id, policy_id, claim_type, claim_status, filed_date, claim_amount.",
            example = "claim_id",
            schema = @Schema(allowableValues = {"claim_id", "policy_id", "claim_type", "claim_status", "filed_date", "claim_amount"})
        )
        @RequestParam(defaultValue = "claim_id") String sortBy,
        @Parameter(
            description = "Sort order (asc or desc)",
            example = "asc",
            required = false,
            schema = @Schema(allowableValues = {"asc", "desc"})
        )
        @RequestParam(defaultValue = "asc", required = false) String sortOrder,
        @Parameter(description = "Page number for pagination", example = "0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size for pagination", example = "10")
        @RequestParam(defaultValue = "10") int size,
        @Parameter(description = "Comma-separated list of policy IDs to filter", required = false)
        @RequestParam(required = false) String policyIds) {

        log.info("Getting claims with filters - database: {}, page: {}, size: {}, sortBy: {}, sortOrder: {}, claimType: {}, status: {}, claimId: {}, search: '{}', policyIds: '{}'",
                database, page, size, sortBy, sortOrder, claimType, status, claimId, searchQuery, policyIds);

        try {
            ClaimResponse response = claimService.getClaimsByFilters(
                database,
                claimType,
                status,
                claimId,
                searchQuery,
                sortBy,
                sortOrder,
                page,
                size,
                policyIds
            );

            log.info("Found {} claims", response.getTotalCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting claims", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Error getting claims: " + e.getMessage()));
        }
    }

    @Operation(
        summary = "Create a new claim",
        description = "Creates a new claim with the provided claim details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Claim object to create. Do not include claimId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Claim.class),
                examples = @ExampleObject(value = "{\"policyId\": 1, \"claimType\": \"Accident\", \"claimStatus\": \"Pending\", \"claimAmount\": 5000.00}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Claim created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Claim.class),
                    examples = @ExampleObject(value = "{\"claimId\": 1, \"policyId\": 1, \"claimType\": \"Accident\", \"claimStatus\": \"Pending\", \"filedDate\": \"2024-05-01\", \"claimAmount\": 5000.00}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid claim data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid claim type\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create claim\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createClaim(
        @RequestBody Claim claim,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            Claim createdClaim = claimService.createClaim(claim, database);
            return ResponseEntity.ok(createdClaim);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create claim: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Delete a claim",
        description = "Deletes a claim by its ID.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Claim deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Claim deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid claim ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete claim\"}")
                )
            )
        }
    )
    @DeleteMapping("/{claimId}")
    public ResponseEntity<?> deleteClaim(
        @Parameter(description = "ID of the claim to delete", required = true, example = "1")
        @PathVariable Long claimId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            claimService.deleteClaim(claimId, database);
            return ResponseEntity.ok(Map.of("message", "Claim deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete claim: " + e.getMessage()));
        }
    }
}
