package io.synthesized.sample.insurance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.synthesized.sample.insurance.service.StatisticsService;
import io.synthesized.sample.insurance.model.Statistics;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.synthesized.sample.insurance.model.ErrorResponse;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
@Tag(name = "Statistics", description = "Insurance statistics API endpoints")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Operation(
        summary = "Get insurance statistics",
        description = "Retrieves statistics about claims, policyholders, policies, and agents.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved statistics",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Statistics.class),
                    examples = @ExampleObject(
                        value = "{\"totalClaims\": 500, \"totalPolicyholders\": 100, \"totalPolicies\": 200, \"totalAgents\": 5}"
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
        summary = "Get policy status counts",
        description = "Retrieves a map of policy statuses and their counts.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved policy status counts",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(
                        value = "{\"Active\": 150, \"Expired\": 30, \"Cancelled\": 5}"
                    )
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve policy status counts\"}")
                )
            )
        }
    )
    @GetMapping("/policy-status-counts")
    public java.util.Map<String, Integer> getPolicyStatusCounts(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        return statisticsService.getPolicyStatusCounts(database);
    }
}
