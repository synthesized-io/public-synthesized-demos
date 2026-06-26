package io.synthesized.sample.healthcare.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.synthesized.sample.healthcare.service.StatisticsService;
import io.synthesized.sample.healthcare.model.Statistics;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.synthesized.sample.healthcare.model.ErrorResponse;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
@Tag(name = "Statistics", description = "Healthcare statistics API endpoints")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Operation(
        summary = "Get healthcare statistics",
        description = "Retrieves statistics about prescriptions, patients, appointments, and providers.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved statistics",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Statistics.class),
                    examples = @ExampleObject(
                        value = "{\"totalPrescriptions\": 500, \"totalPatients\": 100, \"totalAppointments\": 200, \"totalProviders\": 5}"
                    )
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve statistics\"}")
                )
            )
        }
    )
    @GetMapping
    public Statistics getStatistics(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database
    ) {
        return statisticsService.getStatistics(database);
    }

    @Operation(
        summary = "Get appointment status counts",
        description = "Retrieves a map of appointment statuses and their counts.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved appointment status counts",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(
                        value = "{\"Scheduled\": 150, \"Completed\": 30, \"Cancelled\": 5}"
                    )
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve appointment status counts\"}")
                )
            )
        }
    )
    @GetMapping("/appointment-status-counts")
    public java.util.Map<String, Integer> getAppointmentStatusCounts(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        return statisticsService.getAppointmentStatusCounts(database);
    }
}
