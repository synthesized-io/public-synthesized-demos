package io.synthesized.sample.bank.model;

import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Summary statistics for the bank, including totals for transactions, customers, accounts, and branches.",
    example = "{\"totalTransactions\": 500, \"totalCustomers\": 100, \"totalAccounts\": 200, \"totalBranches\": 5}"
)
public class Statistics {
    @Schema(description = "Total number of transactions. Transactions belong to particular accounts.", example = "500")
    private long totalTransactions;

    @Schema(description = "Total number of customers.", example = "100")
    private long totalCustomers;

    @Schema(description = "Total number of accounts. Accounts belong to particular customers.", example = "200")
    private long totalAccounts;

    @Schema(description = "Total number of branches.", example = "5")
    private long totalBranches;
} 