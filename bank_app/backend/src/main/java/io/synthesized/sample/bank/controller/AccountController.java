package io.synthesized.sample.bank.controller;

import io.synthesized.sample.bank.model.Account;
import io.synthesized.sample.bank.model.AccountResponse;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.service.AccountService;
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
import io.synthesized.sample.bank.model.ErrorResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
@Tag(name = "Account Management", description = "APIs for managing bank accounts")
public class AccountController {
    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);
    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @Operation(
        summary = "Get accounts with filters",
        description = "Retrieves a paginated list of accounts with optional filters for account type, status, accountId, and search query. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Accounts retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AccountResponse.class),
                    examples = @ExampleObject(value = "{\"accounts\": [{\"accountId\": 1, \"customerId\": 1, \"accountType\": \"Checking\", \"status\": \"Active\", \"balance\": 1000.00}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve accounts\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<?> getAccounts(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") DatabaseType database,
            @Parameter(description = "Page number for pagination", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size for pagination", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(
                description = "Field to sort by. Allowed values: account_id, customer_id, account_type, status, balance.",
                example = "account_id",
                schema = @Schema(allowableValues = {"account_id", "customer_id", "account_type", "status", "balance"})
            )
            @RequestParam(defaultValue = "account_id") String sortBy,
            @Parameter(
                description = "Sort order (asc or desc)",
                example = "asc",
                required = false,
                schema = @Schema(allowableValues = {"asc", "desc"})
            )
            @RequestParam(defaultValue = "asc", required = false) String sortOrder,
            @Parameter(
                description = "Filter by account type. Allowed values: Checking, Savings, Credit, Loan, Investment.",
                required = false,
                schema = @Schema(allowableValues = {"Checking", "Savings", "Credit", "Loan", "Investment"})
            )
            @RequestParam(required = false) String accountType,
            @Parameter(
                description = "Filter by account status. Allowed values: Active, Closed, Frozen, Dormant, Overdrawn.",
                required = false,
                schema = @Schema(allowableValues = {"Active", "Closed", "Frozen", "Dormant", "Overdrawn"})
            )
            @RequestParam(required = false) String status,
            @Parameter(description = "Filter by account ID", required = false)
            @RequestParam(required = false) String accountId,
            @Parameter(description = "Search query for account name or other fields", required = false)
            @RequestParam(required = false, name = "searchQuery") String search) {
        try {
            logger.info("Getting accounts with filters - database: {}, page: {}, size: {}, sortBy: {}, sortOrder: {}, accountType: {}, status: {}, accountId: {}, search: '{}'",
                    database, page, size, sortBy, sortOrder, accountType, status, accountId, search);
            AccountResponse response = accountService.getAccountsByFilters(
                database, page, size, sortBy, sortOrder, accountType, status, accountId, search);
            logger.info("Found {} accounts", response.getTotalCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting accounts", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @Operation(
        summary = "Create a new account",
        description = "Creates a new account with the provided account details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Account object to create. Do not include accountId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Account.class),
                examples = @ExampleObject(value = "{\"customerId\": 1, \"accountType\": \"Checking\", \"status\": \"Active\", \"balance\": 1000.00}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Account created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Account.class),
                    examples = @ExampleObject(value = "{\"accountId\": 1, \"customerId\": 1, \"accountType\": \"Checking\", \"status\": \"Active\", \"balance\": 1000.00}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid account data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid account type\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create account\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createAccount(
            @RequestBody Account account,
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        try {
            logger.info("Creating new account in database: {} with data: {}", database, account);
            DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
            Account createdAccount = accountService.createAccount(account, databaseType);
            logger.info("Successfully created account with ID: {}", createdAccount.getAccountId());
            return ResponseEntity.ok(createdAccount);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid account data: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error creating account: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An error occurred while creating the account: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Update account status",
        description = "Updates the status of an existing account.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Account object containing the new status. Only the status field is used.",
            content = @Content(
                schema = @Schema(implementation = Account.class),
                examples = @ExampleObject(value = "{\"status\": \"Frozen\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Account status updated successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Account.class),
                    examples = @ExampleObject(value = "{\"accountId\": 1, \"customerId\": 1, \"accountType\": \"Checking\", \"status\": \"Frozen\", \"balance\": 1000.00}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid account data",
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
                    examples = @ExampleObject(value = "{\"error\": \"Failed to update account status\"}")
                )
            )
        }
    )
    @PatchMapping("/{accountId}")
    public ResponseEntity<?> updateAccountStatus(
            @Parameter(description = "ID of the account to update", required = true, example = "1")
            @PathVariable Integer accountId,
            @RequestBody Account account,
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        try {
            logger.info("Updating account status in database: {} for account ID: {} with status: {}", 
                database, accountId, account.getStatus());
            DatabaseType databaseType = DatabaseType.valueOf(database.toUpperCase());
            Account updatedAccount = accountService.updateAccountStatus(accountId, account.getStatus(), databaseType);
            logger.info("Successfully updated account status for ID: {}", accountId);
            return ResponseEntity.ok(updatedAccount);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid account data: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error updating account status: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An error occurred while updating the account status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Delete an account",
        description = "Deletes an account by its ID. Also deletes related transactions.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Account deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Account deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid account ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete account\"}")
                )
            )
        }
    )
    @DeleteMapping("/{accountId}")
    public ResponseEntity<?> deleteAccount(
        @Parameter(description = "ID of the account to delete", required = true, example = "1")
        @PathVariable int accountId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            accountService.deleteAccount(accountId, database);
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete account: " + e.getMessage()));
        }
    }
} 