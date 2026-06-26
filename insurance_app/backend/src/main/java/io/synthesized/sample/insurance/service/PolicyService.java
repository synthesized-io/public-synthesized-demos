package io.synthesized.sample.insurance.service;

import io.synthesized.sample.insurance.model.Policy;
import io.synthesized.sample.insurance.model.PolicyResponse;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.repository.PolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PolicyService {
    private final PolicyRepository policyRepository;

    @Autowired
    public PolicyService(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    public PolicyResponse getPoliciesByFilters(
            DatabaseType databaseType,
            int page,
            int size,
            String sortBy,
            String sortOrder,
            String policyType,
            String status,
            String policyId,
            String search) {
        return policyRepository.findByFilters(databaseType, page, size, sortBy, sortOrder, policyType, status, policyId, search);
    }

    public Policy createPolicy(Policy policy, DatabaseType databaseType) {
        return policyRepository.create(policy, databaseType);
    }

    public Policy updatePolicyStatus(Long policyId, String status, DatabaseType databaseType) {
        // Validate status
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        // Additional business logic validation can be added here
        // For example, you might want to prevent certain status changes based on policy type or current status

        return policyRepository.updateStatus(policyId, status, databaseType);
    }

    public java.util.Map<String, Integer> getPolicyStatusCounts(DatabaseType databaseType) {
        return policyRepository.countPoliciesByStatus(databaseType);
    }

    public void deletePolicy(Long policyId, DatabaseType databaseType) {
        policyRepository.deleteById(policyId, databaseType);
    }
}
