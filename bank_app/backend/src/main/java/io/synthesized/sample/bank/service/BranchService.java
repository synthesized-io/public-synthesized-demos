package io.synthesized.sample.bank.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import io.synthesized.sample.bank.model.Branch;
import io.synthesized.sample.bank.model.DatabaseType;
import io.synthesized.sample.bank.repository.BranchRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BranchService {
    private static final Logger logger = LoggerFactory.getLogger(BranchService.class);
    
    private final BranchRepository branchRepository;

    public List<Branch> getAllBranches(DatabaseType databaseType) {
        return branchRepository.findAll(databaseType);
    }

    public Branch updateBranchManager(Integer branchId, String managerName, DatabaseType databaseType) {
        branchRepository.updateManager(databaseType, branchId.longValue(), managerName);
        return getAllBranches(databaseType).stream()
            .filter(b -> b.getBranchId().equals(branchId))
            .findFirst()
            .orElse(null);
    }

    public void deleteBranch(Integer branchId, DatabaseType databaseType) {
        branchRepository.deleteById(databaseType, branchId);
    }

    public Branch createBranch(Branch branch, DatabaseType databaseType) {
        return branchRepository.create(databaseType, branch);
    }
} 