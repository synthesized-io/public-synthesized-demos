package io.synthesized.sample.healthcare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import io.synthesized.sample.healthcare.model.Provider;
import io.synthesized.sample.healthcare.model.DatabaseType;
import io.synthesized.sample.healthcare.repository.ProviderRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProviderService {
    private static final Logger logger = LoggerFactory.getLogger(ProviderService.class);

    private final ProviderRepository providerRepository;

    public List<Provider> getAllProviders(DatabaseType databaseType) {
        return providerRepository.findAll(databaseType);
    }

    public Provider updateProvider(Long providerId, Provider provider, DatabaseType databaseType) {
        return providerRepository.update(databaseType, providerId, provider);
    }

    public Provider updateProviderSpecialty(Long providerId, String specialty, DatabaseType databaseType) {
        Provider provider = providerRepository.findById(databaseType, providerId);
        provider.setSpecialty(specialty);
        return providerRepository.update(databaseType, providerId, provider);
    }

    public void deleteProvider(Long providerId, DatabaseType databaseType) {
        providerRepository.deleteById(databaseType, providerId);
    }

    public Provider createProvider(Provider provider, DatabaseType databaseType) {
        return providerRepository.create(databaseType, provider);
    }
}
