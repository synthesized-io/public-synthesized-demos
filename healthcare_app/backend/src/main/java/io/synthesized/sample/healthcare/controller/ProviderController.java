package io.synthesized.sample.healthcare.controller;

import io.synthesized.sample.healthcare.model.Provider;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.synthesized.sample.healthcare.model.ErrorResponse;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Provider Management", description = "APIs for managing healthcare providers")
public class ProviderController {

    private final ProviderService providerService;

    @Operation(
        summary = "Get all providers",
        description = "Retrieves a list of all healthcare providers.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Providers retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Provider.class)
                )
            )
        }
    )
    @GetMapping
    public List<Provider> getAllProviders(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        return providerService.getAllProviders(DatabaseType.valueOf(database.toUpperCase()));
    }

    @Operation(
        summary = "Update provider specialty",
        description = "Updates the specialty for a specific provider.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Provider specialty updated successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Provider.class),
                    examples = @ExampleObject(value = "{\"providerId\": 1, \"firstName\": \"Jane\", \"lastName\": \"Smith\", \"email\": \"jane.smith@example.com\", \"phone\": \"9876543210\", \"specialty\": \"Neurology\", \"licenseNumber\": \"LIC-123456\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid provider ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to update provider specialty: ...\"}")
                )
            )
        }
    )
    @PutMapping("/{providerId}/specialty")
    public Provider updateProviderSpecialty(
        @Parameter(description = "ID of the provider to update", required = true, example = "1")
        @PathVariable Long providerId,
        @Parameter(description = "New specialty name", required = true, example = "Neurology")
        @RequestParam String specialty,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        return providerService.updateProviderSpecialty(providerId, specialty, DatabaseType.valueOf(database.toUpperCase()));
    }

    @Operation(
        summary = "Delete a provider",
        description = "Deletes a provider by its ID from the specified database.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Provider deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Provider deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid provider ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete provider: ...\"}")
                )
            )
        }
    )
    @DeleteMapping("/{providerId}")
    public ResponseEntity<?> deleteProvider(
        @Parameter(description = "ID of the provider to delete", required = true, example = "1")
        @PathVariable Long providerId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            providerService.deleteProvider(providerId, DatabaseType.valueOf(database.toUpperCase()));
            return ResponseEntity.ok(java.util.Map.of("message", "Provider deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Failed to delete provider: " + e.getMessage()));
        }
    }

    @Operation(
        summary = "Create a new provider",
        description = "Creates a new provider with the provided provider details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Provider object to create. Do not include providerId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Provider.class),
                examples = @ExampleObject(value = "{\"firstName\": \"Jane\", \"lastName\": \"Smith\", \"email\": \"jane.smith@example.com\", \"phone\": \"9876543210\", \"specialty\": \"Cardiology\", \"licenseNumber\": \"LIC-123456\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Provider created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Provider.class),
                    examples = @ExampleObject(value = "{\"providerId\": 1, \"firstName\": \"Jane\", \"lastName\": \"Smith\", \"email\": \"jane.smith@example.com\", \"phone\": \"9876543210\", \"specialty\": \"Cardiology\", \"licenseNumber\": \"LIC-123456\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid provider data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid specialty\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create provider: ...\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createProvider(
        @RequestBody Provider provider,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            Provider createdProvider = providerService.createProvider(provider, DatabaseType.valueOf(database.toUpperCase()));
            return ResponseEntity.ok(createdProvider);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Failed to create provider: " + e.getMessage()));
        }
    }
}
