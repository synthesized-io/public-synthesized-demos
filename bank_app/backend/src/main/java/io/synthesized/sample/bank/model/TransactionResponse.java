package io.synthesized.sample.bank.model;

import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(
    description = "Paginated response for transactions.",
    example = "{\"transactions\": [{\"transactionId\": 1, \"accountId\": 1, \"transactionType\": \"Deposit\", \"transactionDate\": \"2024-05-01T12:00:00\", \"amount\": 100.00, \"channel\": \"ATM\", \"currency\": \"USD\"}], \"totalCount\": 1}"
)
public class TransactionResponse {
    @Schema(description = "List of transactions in the current page.")
    private List<Transaction> transactions;

    @Schema(description = "Total number of transactions matching the query.", example = "1")
    private long totalCount;

    public TransactionResponse(List<Transaction> transactions, long totalCount) {
        this.transactions = transactions;
        this.totalCount = totalCount;
    }
} 