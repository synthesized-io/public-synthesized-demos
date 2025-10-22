package io.synthesized.sample.bank.controller;

import io.synthesized.sample.bank.model.Transaction;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.model.TransactionResponse;
import io.synthesized.sample.bank.model.ErrorResponse;
import io.synthesized.sample.bank.service.TransactionService;
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
@RequestMapping("/api/transactions")
@Tag(name = "Transaction Management", description = "APIs for managing bank transactions")
@CrossOrigin(origins = "*")
public class TransactionController {
    private final TransactionService transactionService;
    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @Operation(
        summary = "Get transactions with filters",
        description = "Retrieves a paginated list of transactions with optional filters for transaction type, transactionId, search query, and accountIds. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Transactions retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TransactionResponse.class),
                    examples = @ExampleObject(value = "{\"transactions\": [{\"transactionId\": 1, \"accountId\": 1, \"transactionType\": \"Deposit\", \"transactionDate\": \"2024-05-01T12:00:00\", \"amount\": 100.00, \"channel\": \"ATM\", \"currency\": \"USD\"}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve transactions\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<?> getTransactions(
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database,
        @Parameter(
            description = "Filter by transaction type. Allowed values: Deposit, Withdrawal, Transfer, Payment, Fee.",
            required = false,
            schema = @Schema(allowableValues = {"Deposit", "Withdrawal", "Transfer", "Payment", "Fee"})
        )
        @RequestParam(required = false) String transactionType,
        @Parameter(description = "Filter by transaction ID", required = false)
        @RequestParam(required = false) String transactionId,
        @Parameter(description = "Search query for transaction details", required = false)
        @RequestParam(required = false) String searchQuery,
        @Parameter(
            description = "Field to sort by. Allowed values: transaction_id, account_id, transaction_type, transaction_date, amount, channel, currency.",
            example = "transaction_id",
            schema = @Schema(allowableValues = {"transaction_id", "account_id", "transaction_type", "transaction_date", "amount", "channel", "currency"})
        )
        @RequestParam(defaultValue = "transaction_id") String sortBy,
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
        @Parameter(description = "Comma-separated list of account IDs to filter", required = false)
        @RequestParam(required = false) String accountIds) {
        
        log.info("Getting transactions with filters - database: {}, page: {}, size: {}, sortBy: {}, sortOrder: {}, transactionType: {}, transactionId: {}, search: '{}', accountIds: '{}'",
                database, page, size, sortBy, sortOrder, transactionType, transactionId, searchQuery, accountIds);
        
        try {
            TransactionResponse response = transactionService.getTransactionsByFilters(
                database,
                transactionType,
                transactionId,
                searchQuery,
                sortBy,
                sortOrder,
                page,
                size,
                accountIds
            );
            
            log.info("Found {} transactions", response.getTotalCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Error getting transactions: " + e.getMessage()));
        }
    }

    @Operation(
        summary = "Create a new transaction",
        description = "Creates a new transaction with the provided transaction details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Transaction object to create. Do not include transactionId; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Transaction.class),
                examples = @ExampleObject(value = "{\"accountId\": 1, \"transactionType\": \"Deposit\", \"amount\": 100.00, \"channel\": \"ATM\", \"currency\": \"USD\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Transaction created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Transaction.class),
                    examples = @ExampleObject(value = "{\"transactionId\": 1, \"accountId\": 1, \"transactionType\": \"Deposit\", \"transactionDate\": \"2024-05-01T12:00:00\", \"amount\": 100.00, \"channel\": \"ATM\", \"currency\": \"USD\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid transaction data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid transaction type\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create transaction\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<?> createTransaction(
        @RequestBody Transaction transaction,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            Transaction createdTransaction = transactionService.createTransaction(transaction, database);
            return ResponseEntity.ok(createdTransaction);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create transaction: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Delete a transaction",
        description = "Deletes a transaction by its ID.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Transaction deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Transaction deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid transaction ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete transaction\"}")
                )
            )
        }
    )
    @DeleteMapping("/{transactionId}")
    public ResponseEntity<?> deleteTransaction(
        @Parameter(description = "ID of the transaction to delete", required = true, example = "1")
        @PathVariable int transactionId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") DatabaseType database) {
        try {
            transactionService.deleteTransaction(transactionId, database);
            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete transaction: " + e.getMessage()));
        }
    }
} 