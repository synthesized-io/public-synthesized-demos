package io.synthesized.sample.bank.model;

import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Paginated response for accounts.",
    example = "{\"accounts\": [{\"accountId\": 1, \"customerId\": 1, \"accountType\": \"Checking\", \"status\": \"Active\", \"balance\": 1000.00}], \"totalCount\": 1}"
)
public class AccountResponse {
    @Schema(description = "List of accounts in the current page.")
    private List<Account> accounts;

    @Schema(description = "Total number of accounts matching the query.", example = "1")
    private long totalCount;

    public AccountResponse(List<Account> accounts, long totalCount) {
        this.accounts = accounts;
        this.totalCount = totalCount;
    }
} 