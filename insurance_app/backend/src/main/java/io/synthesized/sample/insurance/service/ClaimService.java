package io.synthesized.sample.insurance.service;

import io.synthesized.sample.insurance.model.Claim;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.model.ClaimResponse;
import io.synthesized.sample.insurance.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClaimService {
    private final ClaimRepository claimRepository;

    @Autowired
    public ClaimService(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    public List<Claim> getAllClaims(DatabaseType databaseType) {
        return claimRepository.findAll(databaseType);
    }

    public ClaimResponse getFilteredClaims(
            DatabaseType databaseType,
            String claimType,
            String policyId,
            String searchQuery,
            String sortBy,
            String sortOrder,
            int page,
            int size) {
        return claimRepository.findByFilters(
            databaseType,
            claimType,
            null,  // claimStatus
            null,  // claimId
            searchQuery,
            sortBy,
            sortOrder,
            page,
            size,
            policyId
        );
    }

    public Claim createClaim(Claim claim, DatabaseType databaseType) {
        return claimRepository.create(claim, databaseType);
    }

    public ClaimResponse getClaimsByFilters(
            DatabaseType databaseType,
            String claimType,
            String claimStatus,
            String claimId,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size,
            String policyIds) {
        return claimRepository.findByFilters(
            databaseType,
            claimType,
            claimStatus,
            claimId,
            search,
            sortBy,
            sortOrder,
            page,
            size,
            policyIds
        );
    }

    public void deleteClaim(Long claimId, DatabaseType databaseType) {
        claimRepository.deleteById(claimId, databaseType);
    }
}
