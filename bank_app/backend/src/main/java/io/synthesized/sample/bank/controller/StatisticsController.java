package io.synthesized.sample.bank.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.synthesized.sample.bank.service.StatisticsService;
import io.synthesized.sample.bank.model.Statistics;
import io.synthesized.sample.bank.model.DatabaseType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.synthesized.sample.bank.model.ErrorResponse;

@RestController
@RequestMapping("/api/statistics")
@Tag(name = "Statistics", description = "Bank statistics API endpoints")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Operation(
        summary = "Get bank statistics",
        description = "Retrieves statistics about transactions, customers, accounts, and branches.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved statistics",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Statistics.class),
                    examples = @ExampleObject(
                        value = "{\"totalCustomers\": 100, \"totalAccounts\": 200, \"totalTransactions\": 500, \"totalBranches\": 5}"
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
        summary = "Get account status counts",
        description = "Retrieves a map of account statuses and their counts.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved account status counts",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(
                        value = "{\"Active\": 150, \"Closed\": 30, \"Frozen\": 5}"
                    )
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve account status counts\"}")
                )
            )
        }
    )
    @GetMapping("/account-status-counts")
    public java.util.Map<String, Integer> getAccountStatusCounts(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        return statisticsService.getAccountStatusCounts(database);
    }
} 