package io.synthesized.sample.insurance.controller;

import io.synthesized.sample.insurance.model.Policyholder;
import io.synthesized.sample.insurance.service.PolicyholderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.synthesized.sample.insurance.model.ErrorResponse;

@RestController
@RequestMapping("/api/policyholders")
@CrossOrigin(origins = "*")
@Tag(name = "Policyholder Management", description = "APIs for managing insurance policyholders")
public class PolicyholderController {

    private final PolicyholderService policyholderService;

    @Autowired
    public PolicyholderController(PolicyholderService policyholderService) {
        this.policyholderService = policyholderService;
    }

    @Operation(
        summary = "Get policyholders with filters",
        description = "Retrieves a paginated list of policyholders with optional filters for policyholder type, search query, and policyholderId. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policyholders retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"policyholders\": [{\"policyholderId\": 1, \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"policyholderType\": \"Individual\"}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve policyholders\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPolicyholders(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Page number for pagination", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size for pagination", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(
                description = "Field to sort by. Allowed values: policyholder_id, first_name, last_name, email, phone, policyholder_type, created_at.",
                example = "policyholder_id",
                required = false,
                schema = @Schema(allowableValues = {"policyholder_id", "first_name", "last_name", "email", "phone", "policyholder_type", "created_at"})
            )
            @RequestParam(defaultValue = "policyholder_id") String sortBy,
            @Parameter(
                description = "Sort order (asc or desc)",
                example = "asc",
                required = false,
                schema = @Schema(allowableValues = {"asc", "desc"})
            )
            @RequestParam(defaultValue = "asc", required = false) String sortOrder,
            @Parameter(
                description = "Filter by policyholder type. Allowed values: Individual, Business, Family, Group.",
                required = false,
                schema = @Schema(allowableValues = {"Individual", "Business", "Family", "Group"})
            )
            @RequestParam(required = false) String policyholderType,
            @Parameter(description = "Search query for policyholder name or other fields", required = false)
            @RequestParam(required = false) String searchQuery,
            @Parameter(description = "Filter by policyholder ID", required = false)
            @RequestParam(required = false) String policyholderId) {
        try {
            List<Policyholder> policyholders = policyholderService.getPolicyholders(database, page, size, sortBy, sortOrder, policyholderType, searchQuery, policyholderId);
            int totalCount = policyholderService.count(database, policyholderType, searchQuery, policyholderId);

            Map<String, Object> response = new HashMap<>();
            response.put("policyholders", policyholders);
            response.put("totalCount", totalCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
        summary = "Get policyholder by ID",
        description = "Retrieves a single policyholder by their ID.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policyholder retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Policyholder.class),
                    examples = @ExampleObject(value = "{\"policyholderId\": 1, \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"policyholderType\": \"Individual\"}")
                )
            ),
            @ApiResponse(
                responseCode = "404",
                description = "Policyholder not found",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Policyholder not found\"}")
                )
            )
        }
    )
    @GetMapping("/{policyholderId}")
    public ResponseEntity<Policyholder> getPolicyholder(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "ID of the policyholder to retrieve", required = true)
            @PathVariable Long policyholderId) {
        Policyholder policyholder = policyholderService.getPolicyholder(database, policyholderId);
        return ResponseEntity.ok(policyholder);
    }

    @Operation(
        summary = "Create a new policyholder",
        description = "Creates a new policyholder with the provided policyholder details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Policyholder object to create. Do not include policyholderId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Policyholder.class),
                examples = @ExampleObject(value = "{\"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"policyholderType\": \"Individual\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policyholder created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Policyholder.class),
                    examples = @ExampleObject(value = "{\"policyholderId\": 1, \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"policyholderType\": \"Individual\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid policyholder data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid policyholder type\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create policyholder\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<Policyholder> createPolicyholder(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Policyholder object to create", required = true)
            @RequestBody Policyholder policyholder) {
        Policyholder createdPolicyholder = policyholderService.createPolicyholder(database, policyholder);
        return ResponseEntity.ok(createdPolicyholder);
    }

    @Operation(
        summary = "Delete a policyholder",
        description = "Deletes a policyholder by their ID. Also deletes all related policies and claims.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Policyholder deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Policyholder deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid policyholder ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete policyholder\"}")
                )
            )
        }
    )
    @DeleteMapping("/{policyholderId}")
    public ResponseEntity<?> deletePolicyholder(
        @Parameter(description = "ID of the policyholder to delete", required = true, example = "1")
        @PathVariable Long policyholderId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            policyholderService.deletePolicyholder(database, policyholderId);
            return ResponseEntity.ok(Map.of("message", "Policyholder deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete policyholder: " + e.getMessage()));
        }
    }
}
