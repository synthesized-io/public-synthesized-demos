package io.synthesized.sample.insurance.controller;

import io.synthesized.sample.insurance.model.Agent;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.service.AgentService;
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
import io.synthesized.sample.insurance.model.ErrorResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Agent Management", description = "APIs for managing insurance agents")
public class AgentController {

    private final AgentService agentService;

    @Operation(
        summary = "Get all agents",
        description = "Retrieves a list of all insurance agents.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Agents retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Agent.class)
                )
            )
        }
    )
    @GetMapping
    public List<Agent> getAllAgents(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        return agentService.getAllAgents(DatabaseType.valueOf(database.toUpperCase()));
    }

    @Operation(
        summary = "Update agent region",
        description = "Updates the region for a specific agent.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Agent region updated successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Agent.class),
                    examples = @ExampleObject(value = "{\"agentId\": 1, \"firstName\": \"Jane\", \"lastName\": \"Smith\", \"email\": \"jane.smith@example.com\", \"phone\": \"9876543210\", \"region\": \"Southeast\", \"licenseNumber\": \"LIC-123456\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid agent ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to update agent region: ...\"}")
                )
            )
        }
    )
    @PutMapping("/{agentId}/region")
    public ResponseEntity<Map<String, String>> updateAgentRegion(
        @Parameter(description = "ID of the agent to update", required = true, example = "1")
        @PathVariable Long agentId,
        @Parameter(description = "New region name", required = true, example = "Southeast")
        @RequestParam String region,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        agentService.updateAgentRegion(agentId, region, DatabaseType.valueOf(database.toUpperCase()));
        return ResponseEntity.ok(Map.of("message", "Agent region updated successfully"));
    }

    @Operation(
        summary = "Delete an agent",
        description = "Deletes an agent by its ID from the specified database.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Agent deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Agent deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid agent ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete agent: ...\"}")
                )
            )
        }
    )
    @DeleteMapping("/{agentId}")
    public ResponseEntity<?> deleteAgent(
        @Parameter(description = "ID of the agent to delete", required = true, example = "1")
        @PathVariable Long agentId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            agentService.deleteAgent(agentId, DatabaseType.valueOf(database.toUpperCase()));
            return ResponseEntity.ok(java.util.Map.of("message", "Agent deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Failed to delete agent: " + e.getMessage()));
        }
    }

    @Operation(
        summary = "Create a new agent",
        description = "Creates a new agent with the provided agent details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Agent object to create. Do not include agentId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Agent.class),
                examples = @ExampleObject(value = "{\"firstName\": \"Jane\", \"lastName\": \"Smith\", \"email\": \"jane.smith@example.com\", \"phone\": \"9876543210\", \"region\": \"Northeast\", \"licenseNumber\": \"LIC-123456\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Agent created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Agent.class),
                    examples = @ExampleObject(value = "{\"agentId\": 1, \"firstName\": \"Jane\", \"lastName\": \"Smith\", \"email\": \"jane.smith@example.com\", \"phone\": \"9876543210\", \"region\": \"Northeast\", \"licenseNumber\": \"LIC-123456\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid agent data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid region\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create agent: ...\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createAgent(
        @RequestBody Agent agent,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            Agent createdAgent = agentService.createAgent(agent, DatabaseType.valueOf(database.toUpperCase()));
            return ResponseEntity.ok(createdAgent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Failed to create agent: " + e.getMessage()));
        }
    }
}
