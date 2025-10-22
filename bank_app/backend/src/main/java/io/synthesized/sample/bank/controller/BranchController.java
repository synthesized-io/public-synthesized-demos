package io.synthesized.sample.bank.controller;

import io.synthesized.sample.bank.model.Branch;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.service.BranchService;
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
import io.synthesized.sample.bank.model.ErrorResponse;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@Tag(name = "Branch Management", description = "APIs for managing bank branches")
public class BranchController {

    private final BranchService branchService;

    @Operation(
        summary = "Get all branches",
        description = "Retrieves a list of all bank branches.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Branches retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Branch.class)
                )
            )
        }
    )
    @GetMapping
    public List<Branch> getAllBranches(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        return branchService.getAllBranches(DatabaseType.valueOf(database.toUpperCase()));
    }

    @Operation(
        summary = "Update branch manager",
        description = "Updates the manager name for a specific branch.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Branch manager updated successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Branch.class),
                    examples = @ExampleObject(value = "{\"branch_id\": 1, \"name\": \"Main Street\", \"region\": \"North\", \"manager_name\": \"Alice Band\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid branch ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to update branch manager: ...\"}")
                )
            )
        }
    )
    @PutMapping("/{branchId}/manager")
    public Branch updateBranchManager(
        @Parameter(description = "ID of the branch to update", required = true, example = "1")
        @PathVariable Integer branchId,
        @Parameter(description = "New manager name", required = true, example = "Alice Band")
        @RequestParam String managerName,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        return branchService.updateBranchManager(branchId, managerName, DatabaseType.valueOf(database.toUpperCase()));
    }

    @Operation(
        summary = "Delete a branch",
        description = "Deletes a branch by its ID from the specified database.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Branch deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Branch deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid branch ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete branch: ...\"}")
                )
            )
        }
    )
    @DeleteMapping("/{branchId}")
    public ResponseEntity<?> deleteBranch(
        @Parameter(description = "ID of the branch to delete", required = true, example = "1")
        @PathVariable Integer branchId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            branchService.deleteBranch(branchId, DatabaseType.valueOf(database.toUpperCase()));
            return ResponseEntity.ok(java.util.Map.of("message", "Branch deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Failed to delete branch: " + e.getMessage()));
        }
    }

    @Operation(
        summary = "Create a new branch",
        description = "Creates a new branch with the provided branch details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Branch object to create. Do not include branch_id; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Branch.class),
                examples = @ExampleObject(value = "{\"name\": \"Main Street\", \"region\": \"North\", \"manager_name\": \"Alice Band\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Branch created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Branch.class),
                    examples = @ExampleObject(value = "{\"branch_id\": 1, \"name\": \"Main Street\", \"region\": \"North\", \"manager_name\": \"Alice Band\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid branch data",
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
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create branch: ...\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createBranch(
        @RequestBody Branch branch,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            Branch createdBranch = branchService.createBranch(branch, DatabaseType.valueOf(database.toUpperCase()));
            return ResponseEntity.ok(createdBranch);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Failed to create branch: " + e.getMessage()));
        }
    }
} 