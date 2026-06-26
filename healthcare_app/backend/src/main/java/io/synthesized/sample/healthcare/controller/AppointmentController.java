package io.synthesized.sample.healthcare.controller;

import io.synthesized.sample.healthcare.model.Appointment;
import io.synthesized.sample.healthcare.model.AppointmentResponse;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.service.AppointmentService;
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
import io.synthesized.sample.healthcare.model.ErrorResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
@Tag(name = "Appointment Management", description = "APIs for managing healthcare appointments")
public class AppointmentController {
    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);
    private final AppointmentService appointmentService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @Operation(
        summary = "Get appointments with filters",
        description = "Retrieves a paginated list of appointments with optional filters for appointment type, status, appointmentId, and search query. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Appointments retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AppointmentResponse.class),
                    examples = @ExampleObject(value = "{\"appointments\": [{\"appointmentId\": 1, \"patientId\": 1, \"appointmentType\": \"Checkup\", \"status\": \"Scheduled\"}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve appointments\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<?> getAppointments(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") DatabaseType database,
            @Parameter(description = "Page number for pagination", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size for pagination", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(
                description = "Field to sort by. Allowed values: appointment_id, patient_id, appointment_type, status, appointment_date.",
                example = "appointment_id",
                schema = @Schema(allowableValues = {"appointment_id", "patient_id", "appointment_type", "status", "appointment_date"})
            )
            @RequestParam(defaultValue = "appointment_id") String sortBy,
            @Parameter(
                description = "Sort order (asc or desc)",
                example = "asc",
                required = false,
                schema = @Schema(allowableValues = {"asc", "desc"})
            )
            @RequestParam(defaultValue = "asc", required = false) String sortOrder,
            @Parameter(
                description = "Filter by appointment type. Allowed values: Checkup, Consultation, Surgery, Emergency, Follow-up.",
                required = false,
                schema = @Schema(allowableValues = {"Checkup", "Consultation", "Surgery", "Emergency", "Follow-up"})
            )
            @RequestParam(required = false) String appointmentType,
            @Parameter(
                description = "Filter by appointment status. Allowed values: Scheduled, Confirmed, Completed, Cancelled, No-show.",
                required = false,
                schema = @Schema(allowableValues = {"Scheduled", "Confirmed", "Completed", "Cancelled", "No-show"})
            )
            @RequestParam(required = false) String status,
            @Parameter(description = "Filter by appointment ID", required = false)
            @RequestParam(required = false) String appointmentId,
            @Parameter(description = "Filter by patient ID", required = false)
            @RequestParam(required = false) String patientId,
            @Parameter(description = "Filter by provider ID", required = false)
            @RequestParam(required = false) String providerId,
            @Parameter(description = "Search query for appointment details", required = false)
            @RequestParam(required = false, name = "searchQuery") String search,
            @Parameter(description = "Filter appointments from this date (ISO 8601 format)", required = false)
            @RequestParam(required = false) String fromDate,
            @Parameter(description = "Filter appointments to this date (ISO 8601 format)", required = false)
            @RequestParam(required = false) String toDate) {
        try {
            logger.info("Getting appointments with filters - database: {}, page: {}, size: {}, sortBy: {}, sortOrder: {}, appointmentType: {}, status: {}, appointmentId: {}, patientId: {}, providerId: {}, search: '{}', fromDate: {}, toDate: {}",
                    database, page, size, sortBy, sortOrder, appointmentType, status, appointmentId, patientId, providerId, search, fromDate, toDate);
            AppointmentResponse response = appointmentService.getAppointmentsByFilters(
                database, page, size, sortBy, sortOrder, appointmentType, status, appointmentId, patientId, providerId, search, fromDate, toDate);
            logger.info("Found {} appointments", response.getTotalCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting appointments", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @Operation(
        summary = "Create a new appointment",
        description = "Creates a new appointment with the provided appointment details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Appointment object to create. Do not include appointmentId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Appointment.class),
                examples = @ExampleObject(value = "{\"patientId\": 1, \"appointmentType\": \"Checkup\", \"status\": \"Scheduled\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Appointment created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Appointment.class),
                    examples = @ExampleObject(value = "{\"appointmentId\": 1, \"patientId\": 1, \"appointmentType\": \"Checkup\", \"status\": \"Scheduled\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid appointment data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid appointment type\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create appointment\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createAppointment(
            @RequestBody Appointment appointment,
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        try {
            logger.info("Creating new appointment in database: {} with data: {}", database, appointment);
            DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
            Appointment createdAppointment = appointmentService.createAppointment(appointment, databaseType);
            logger.info("Successfully created appointment with ID: {}", createdAppointment.getAppointmentId());
            return ResponseEntity.ok(createdAppointment);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid appointment data: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error creating appointment: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An error occurred while creating the appointment: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Update appointment status",
        description = "Updates the status of an existing appointment.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Appointment object containing the new status. Only the status field is used.",
            content = @Content(
                schema = @Schema(implementation = Appointment.class),
                examples = @ExampleObject(value = "{\"status\": \"Cancelled\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Appointment status updated successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Appointment.class),
                    examples = @ExampleObject(value = "{\"appointmentId\": 1, \"patientId\": 1, \"appointmentType\": \"Checkup\", \"status\": \"Cancelled\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid appointment data",
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
                    examples = @ExampleObject(value = "{\"error\": \"Failed to update appointment status\"}")
                )
            )
        }
    )
    @PatchMapping("/{appointmentId}")
    public ResponseEntity<?> updateAppointmentStatus(
            @Parameter(description = "ID of the appointment to update", required = true, example = "1")
            @PathVariable Long appointmentId,
            @RequestBody Appointment appointment,
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        try {
            logger.info("Updating appointment status in database: {} for appointment ID: {} with status: {}",
                database, appointmentId, appointment.getStatus());
            DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(appointmentId, appointment.getStatus(), databaseType);
            logger.info("Successfully updated appointment status for ID: {}", appointmentId);
            return ResponseEntity.ok(updatedAppointment);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid appointment data: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error updating appointment status: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An error occurred while updating the appointment status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Delete an appointment",
        description = "Deletes an appointment by its ID. Also deletes related prescriptions.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Appointment deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Appointment deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid appointment ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete appointment\"}")
                )
            )
        }
    )
    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<?> deleteAppointment(
        @Parameter(description = "ID of the appointment to delete", required = true, example = "1")
        @PathVariable Long appointmentId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            appointmentService.deleteAppointment(appointmentId, database);
            return ResponseEntity.ok(Map.of("message", "Appointment deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete appointment: " + e.getMessage()));
        }
    }
}
