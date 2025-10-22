package io.synthesized.sample.bank.controller;

import io.synthesized.sample.bank.model.Customer;
import io.synthesized.sample.bank.service.CustomerService;
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
import io.synthesized.sample.bank.model.ErrorResponse;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
@Tag(name = "Customer Management", description = "APIs for managing bank customers")
public class CustomerController {

    private final CustomerService customerService;

    @Autowired
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Operation(
        summary = "Get customers with filters",
        description = "Retrieves a paginated list of customers with optional filters for customer type, search query, and customerId. Supports sorting and pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Customers retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"customers\": [{\"customer_id\": 1, \"first_name\": \"John\", \"last_name\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"customer_type\": \"Individual\"}], \"totalCount\": 1}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to retrieve customers\"}")
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCustomers(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Page number for pagination", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size for pagination", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(
                description = "Field to sort by. Allowed values: customer_id, first_name, last_name, email, phone, customer_type, created_at.",
                example = "customer_id",
                required = false,                
                schema = @Schema(allowableValues = {"customer_id", "first_name", "last_name", "email", "phone", "customer_type", "created_at"})
            )
            @RequestParam(defaultValue = "customer_id") String sortBy,
            @Parameter(
                description = "Sort order (asc or desc)",
                example = "asc",
                required = false,
                schema = @Schema(allowableValues = {"asc", "desc"})
            )
            @RequestParam(defaultValue = "asc", required = false) String sortOrder,
            @Parameter(
                description = "Filter by customer type. Allowed values: Individual, Business, VIP, Government, Nonprofit.",
                required = false,
                schema = @Schema(allowableValues = {"Individual", "Business", "VIP", "Government", "Nonprofit"})
            )
            @RequestParam(required = false) String customerType,
            @Parameter(description = "Search query for customer name or other fields", required = false)
            @RequestParam(required = false) String searchQuery,
            @Parameter(description = "Filter by customer ID", required = false)
            @RequestParam(required = false) String customerId) {
        try {
            List<Customer> customers = customerService.getCustomers(database, page, size, sortBy, sortOrder, customerType, searchQuery, customerId);
            int totalCount = customerService.count(database, customerType, searchQuery, customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("customers", customers);
            response.put("totalCount", totalCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
        summary = "Get customer by ID",
        description = "Retrieves a single customer by their ID.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Customer retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Customer.class),
                    examples = @ExampleObject(value = "{\"customer_id\": 1, \"first_name\": \"John\", \"last_name\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"customer_type\": \"Individual\"}")
                )
            ),
            @ApiResponse(
                responseCode = "404",
                description = "Customer not found",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Customer not found\"}")
                )
            )
        }
    )
    @GetMapping("/{customerId}")
    public ResponseEntity<Customer> getCustomer(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "ID of the customer to retrieve", required = true)
            @PathVariable Long customerId) {
        Customer customer = customerService.getCustomer(database, customerId);
        return ResponseEntity.ok(customer);
    }

    @Operation(
        summary = "Create a new customer",
        description = "Creates a new customer with the provided customer details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Customer object to create. Do not include customer_id; it is auto-generated.",
            content = @Content(
                schema = @Schema(implementation = Customer.class),
                examples = @ExampleObject(value = "{\"first_name\": \"John\", \"last_name\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"customer_type\": \"Individual\"}")
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Customer created successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Customer.class),
                    examples = @ExampleObject(value = "{\"customer_id\": 1, \"first_name\": \"John\", \"last_name\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"1234567890\", \"customer_type\": \"Individual\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid customer data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid customer type\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to create customer\"}")
                )
            )
        }
    )
    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Customer object to create", required = true)
            @RequestBody Customer customer) {
        Customer createdCustomer = customerService.createCustomer(database, customer);
        return ResponseEntity.ok(createdCustomer);
    }

    @Operation(
        summary = "Delete a customer",
        description = "Deletes a customer by their ID. Also deletes all related accounts and transactions.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Customer deleted successfully",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"message\": \"Customer deleted successfully\"}")
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Invalid customer ID\"}")
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class),
                    examples = @ExampleObject(value = "{\"error\": \"Failed to delete customer\"}")
                )
            )
        }
    )
    @DeleteMapping("/{customerId}")
    public ResponseEntity<?> deleteCustomer(
        @Parameter(description = "ID of the customer to delete", required = true, example = "1")
        @PathVariable Long customerId,
        @Parameter(hidden = true)
        @RequestParam(defaultValue = "TESTING") String database) {
        try {
            customerService.deleteCustomer(database, customerId);
            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete customer: " + e.getMessage()));
        }
    }
} 