package es.ual.dream_team_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.ual.dream_team_service.client.GroqClient;
import es.ual.dream_team_service.client.PlayerClient;
import es.ual.dream_team_service.domain.DreamTeam;
import es.ual.dream_team_service.dto.PlayerSummaryDTO;
import es.ual.dream_team_service.repository.DreamTeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DreamTeamService {

    @Autowired
    private DreamTeamRepository repository;

    private final GroqClient groqClient;
    private final PlayerClient playerClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public DreamTeamService(DreamTeamRepository repository, GroqClient groqClient, PlayerClient playerClient, 
                            ObjectMapper objectMapper, @Value("${groq.api.key}") String apiKey) {
        this.repository = repository;
        this.groqClient = groqClient;
        this.playerClient = playerClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    public DreamTeam generateAndSaveDreamTeam(String userId) throws Exception {
        List<PlayerSummaryDTO> allPlayers = playerClient.getPlayersSummary();
        if (allPlayers == null || allPlayers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "No players available to generate a team");
        }
        List<PlayerSummaryDTO> playersToSend = allPlayers.stream().limit(50).collect(Collectors.toList());
        String prompt = "You are an expert football coach. Select 11 players from this list: " + 
                objectMapper.writeValueAsString(playersToSend) + ". " +
                "STRICT RULES: 1. If >= 11 players, select 11. 2. If < 11, select ALL. " +
                "3. If empty, return empty array. 4. Creative Spanish name. " +
                "5. Return ONLY raw JSON: {\"name\": \"...\", \"playerIds\": [...]}";
        Map<String, Object> request = Map.of(
            "model", "llama-3.1-8b-instant",
            "messages", List.of(Map.of("role", "user", "content", prompt))
        );
        Map<String, Object> response = groqClient.getCompletion("Bearer " + apiKey, request);
        String content = (String) ((Map<String, Object>) ((List<Map<String, Object>>) response.get("choices")).get(0).get("message")).get("content");
        content = content.replaceAll("```json", "").replaceAll("```", "").trim();
        DreamTeam newTeam = objectMapper.readValue(content, DreamTeam.class);
        if (newTeam.getPlayerIds() == null || newTeam.getPlayerIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Failed to generate team: player list is empty");
        }
        newTeam.setUserId(userId);
        newTeam.setCreatedAt(LocalDateTime.now());
        return repository.save(newTeam);
    }
}
