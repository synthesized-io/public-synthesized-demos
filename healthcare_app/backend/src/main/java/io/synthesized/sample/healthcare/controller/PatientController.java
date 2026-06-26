package io.synthesized.sample.healthcare.controller;

import io.synthesized.sample.healthcare.model.Patient;
import io.synthesized.sample.healthcare.service.PatientService;
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
import io.synthesized.sample.healthcare.model.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
@Tag(name = "Patient Management", description = "APIs for managing healthcare patients")
public class PatientController {

    private static final Logger log = LoggerFactory.getLogger(PatientController.class);
    private final PatientService patientService;

    @Autowired
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @Operation(
        summary = "Get patients with filters",
        description = "Retrieves a paginated list of patients with optional filters for blood type, search query, and patientId. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Patients retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"patients\": [{\"patientId\": 1, \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"gender\": \"Male\"}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve patients\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPatients(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Page number for pagination", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size for pagination", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(
                description = "Field to sort by. Allowed values: patient_id, first_name, last_name, email, phone, blood_type, created_at.",
                example = "patient_id",
                required = false,
                schema = @Schema(allowableValues = {"patient_id", "first_name", "last_name", "email", "phone", "blood_type", "created_at"})
            )
            @RequestParam(defaultValue = "patient_id") String sortBy,
            @Parameter(
                description = "Sort order (asc or desc)",
                example = "asc",
                required = false,
                schema = @Schema(allowableValues = {"asc", "desc"})
            )
            @RequestParam(defaultValue = "asc", required = false) String sortOrder,
            @Parameter(
                description = "Filter by blood type. Allowed values: A+, A-, B+, B-, AB+, AB-, O+, O-.",
                required = false,
                schema = @Schema(allowableValues = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"})
            )
            @RequestParam(required = false) String bloodType,
            @Parameter(description = "Search query for patient name or other fields", required = false)
            @RequestParam(required = false) String searchQuery,
            @Parameter(description = "Filter by patient ID", required = false)
            @RequestParam(required = false) String patientId) {
        try {
            log.info("Getting patients with filters - database: {}, page: {}, size: {}, sortBy: {}, sortOrder: {}, bloodType: {}, patientId: {}, searchQuery: '{}'",
                    database, page, size, sortBy, sortOrder, bloodType, patientId, searchQuery);
            List<Patient> patients = patientService.getPatients(database, page, size, sortBy, sortOrder, bloodType, searchQuery, patientId);
            int totalCount = patientService.count(database, bloodType, searchQuery, patientId);
            log.info("Found {} patients", totalCount);

            Map<String, Object> response = new HashMap<>();
            response.put("patients", patients);
            response.put("totalCount", totalCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting patients", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
        summary = "Get patient by ID",
        description = "Retrieves a single patient by their ID.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Patient retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Patient.class),
                    examples = @ExampleObject(value = "{\"patientId\": 1, \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"gender\": \"Male\"}")
                )
            ),
            @ApiResponse(
                responseCode = "404",
                description = "Patient not found",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Patient not found\"}")
                )
            )
        }
    )
    @GetMapping("/{patientId}")
    public ResponseEntity<Patient> getPatient(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "ID of the patient to retrieve", required = true)
            @PathVariable Long patientId) {
        Patient patient = patientService.getPatient(database, patientId);
        return ResponseEntity.ok(patient);
    }

    @Operation(
        summary = "Create a new patient",
        description = "Creates a new patient with the provided patient details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Patient object to create. Do not include patientId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Patient.class),
                examples = @ExampleObject(value = "{\"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"gender\": \"Male\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Patient created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Patient.class),
                    examples = @ExampleObject(value = "{\"patientId\": 1, \"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"gender\": \"Male\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid patient data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid gender\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create patient\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<Patient> createPatient(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Patient object to create", required = true)
            @RequestBody Patient patient) {
        Patient createdPatient = patientService.createPatient(database, patient);
        return ResponseEntity.ok(createdPatient);
    }

    @Operation(
        summary = "Delete a patient",
        description = "Deletes a patient by their ID. Also deletes all related appointments and prescriptions.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Patient deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Patient deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid patient ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete patient\"}")
                )
            )
        }
    )
    @DeleteMapping("/{patientId}")
    public ResponseEntity<?> deletePatient(
        @Parameter(description = "ID of the patient to delete", required = true, example = "1")
        @PathVariable Long patientId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            patientService.deletePatient(database, patientId);
            return ResponseEntity.ok(Map.of("message", "Patient deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete patient: " + e.getMessage()));
        }
    }
}
