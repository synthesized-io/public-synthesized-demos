package io.synthesized.sample.insurance.service;

import io.synthesized.sample.insurance.model.Policyholder;
import io.synthesized.sample.insurance.repository.PolicyholderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class PolicyholderService {

    private final PolicyholderRepository policyholderRepository;

    @Autowired
    public PolicyholderService(PolicyholderRepository policyholderRepository) {
        this.policyholderRepository = policyholderRepository;
    }

    public Map<String, Object> getPolicyholders(String database, int page, int size, String sortBy, String sortOrder,
                                          String policyholderType, String searchQuery) {
        List<Policyholder> policyholders = policyholderRepository.findAll(database, page, size, sortBy, sortOrder, policyholderType, searchQuery, null);
        int totalCount = policyholderRepository.count(database, policyholderType, searchQuery, null);

        Map<String, Object> result = new HashMap<>();
        result.put("policyholders", policyholders);
        result.put("totalCount", totalCount);
        return result;
    }

    public Policyholder getPolicyholder(String database, Long policyholderId) {
        return policyholderRepository.findById(database, policyholderId);
    }

    public Policyholder createPolicyholder(String database, Policyholder policyholder) {
        return policyholderRepository.create(database, policyholder);
    }

    public List<Policyholder> getPolicyholders(String database, int page, int size, String sortBy, String sortOrder,
                                     String policyholderType, String searchQuery, String policyholderId) {
        return policyholderRepository.findAll(database, page, size, sortBy, sortOrder, policyholderType, searchQuery, policyholderId);
    }

    public int count(String database, String policyholderType, String searchQuery, String policyholderId) {
        return policyholderRepository.count(database, policyholderType, searchQuery, policyholderId);
    }

    public Policyholder getPolicyholderById(String database, Long policyholderId) {
        return policyholderRepository.findById(database, policyholderId);
    }

    public void deletePolicyholder(String database, Long policyholderId) {
        policyholderRepository.deleteById(database, policyholderId);
    }
}
