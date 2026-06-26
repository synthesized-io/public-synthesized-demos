package io.synthesized.sample.healthcare.controller;

import io.synthesized.sample.healthcare.model.Prescription;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.model.PrescriptionResponse;
import io.synthesized.sample.healthcare.model.ErrorResponse;
import io.synthesized.sample.healthcare.service.PrescriptionService;
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
@RequestMapping("/api/prescriptions")
@Tag(name = "Prescription Management", description = "APIs for managing medical prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;
    private static final Logger log = LoggerFactory.getLogger(PrescriptionController.class);

    @Autowired
    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @Operation(
        summary = "Get prescriptions with filters",
        description = "Retrieves a paginated list of prescriptions with optional filters for medication name, prescriptionId, search query, and appointmentIds. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Prescriptions retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PrescriptionResponse.class),
                    examples = @ExampleObject(value = "{\"prescriptions\": [{\"prescriptionId\": 1, \"appointmentId\": 1, \"medicationName\": \"Amoxicillin\", \"dosage\": \"500mg\"}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve prescriptions\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<?> getPrescriptions(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database,
        @Parameter(
            description = "Filter by medication name (partial match supported).",
            required = false
        )
        @RequestParam(required = false) String medicationName,
        @Parameter(description = "Filter by prescription ID", required = false)
        @RequestParam(required = false) String prescriptionId,
        @Parameter(description = "Filter by patient ID", required = false)
        @RequestParam(required = false) String patientId,
        @Parameter(description = "Filter by provider ID", required = false)
        @RequestParam(required = false) String providerId,
        @Parameter(description = "Search query for prescription details", required = false)
        @RequestParam(required = false) String searchQuery,
        @Parameter(
            description = "Field to sort by. Allowed values: prescription_id, appointment_id, medication_name, start_date.",
            example = "prescription_id",
            schema = @Schema(allowableValues = {"prescription_id", "appointment_id", "medication_name", "start_date"})
        )
        @RequestParam(defaultValue = "prescription_id") String sortBy,
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
        @Parameter(description = "Comma-separated list of appointment IDs to filter", required = false)
        @RequestParam(required = false) String appointmentIds) {

        log.info("Getting prescriptions with filters - database: {}, page: {}, size: {}, sortBy: {}, sortOrder: {}, medicationName: {}, prescriptionId: {}, patientId: {}, providerId: {}, search: '{}', appointmentIds: '{}'",
                database, page, size, sortBy, sortOrder, medicationName, prescriptionId, patientId, providerId, searchQuery, appointmentIds);

        try {
            PrescriptionResponse response = prescriptionService.getPrescriptionsByFilters(
                database,
                medicationName,
                prescriptionId,
                patientId,
                providerId,
                searchQuery,
                sortBy,
                sortOrder,
                page,
                size,
                appointmentIds
            );

            log.info("Found {} prescriptions", response.getTotalCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting prescriptions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Error getting prescriptions: " + e.getMessage()));
        }
    }

    @Operation(
        summary = "Create a new prescription",
        description = "Creates a new prescription with the provided prescription details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Prescription object to create. Do not include prescriptionId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Prescription.class),
                examples = @ExampleObject(value = "{\"appointmentId\": 1, \"medicationName\": \"Amoxicillin\", \"dosage\": \"500mg\", \"frequency\": \"Twice daily\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Prescription created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Prescription.class),
                    examples = @ExampleObject(value = "{\"prescriptionId\": 1, \"appointmentId\": 1, \"medicationName\": \"Amoxicillin\", \"dosage\": \"500mg\", \"frequency\": \"Twice daily\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid prescription data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid frequency\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create prescription\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createPrescription(
        @RequestBody Prescription prescription,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            Prescription createdPrescription = prescriptionService.createPrescription(prescription, database);
            return ResponseEntity.ok(createdPrescription);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create prescription: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Delete a prescription",
        description = "Deletes a prescription by its ID.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Prescription deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Prescription deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid prescription ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete prescription\"}")
                )
            )
        }
    )
    @DeleteMapping("/{prescriptionId}")
    public ResponseEntity<?> deletePrescription(
        @Parameter(description = "ID of the prescription to delete", required = true, example = "1")
        @PathVariable Long prescriptionId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            prescriptionService.deletePrescription(prescriptionId, database);
            return ResponseEntity.ok(Map.of("message", "Prescription deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete prescription: " + e.getMessage()));
        }
    }
}
