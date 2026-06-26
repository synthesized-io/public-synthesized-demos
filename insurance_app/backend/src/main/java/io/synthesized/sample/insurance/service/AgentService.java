package io.synthesized.sample.insurance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import io.synthesized.sample.insurance.model.Agent;
import io.synthesized.sample.insurance.model.DatabaseType;
import io.synthesized.sample.insurance.repository.AgentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgentService {
    private static final Logger logger = LoggerFactory.getLogger(AgentService.class);

    private final AgentRepository agentRepository;

    public List<Agent> getAllAgents(DatabaseType databaseType) {
        return agentRepository.findAll(databaseType);
    }

    public Agent updateAgent(Long agentId, Agent agent, DatabaseType databaseType) {
        return agentRepository.update(databaseType, agentId, agent);
    }

    public void updateAgentRegion(Long agentId, String region, DatabaseType databaseType) {
        agentRepository.updateRegion(databaseType, agentId, region);
    }

    public void deleteAgent(Long agentId, DatabaseType databaseType) {
        agentRepository.deleteById(databaseType, agentId);
    }

    public Agent createAgent(Agent agent, DatabaseType databaseType) {
        return agentRepository.create(databaseType, agent);
    }
}
