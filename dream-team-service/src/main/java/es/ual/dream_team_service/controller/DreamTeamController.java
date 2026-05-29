package es.ual.dream_team_service.controller;

import es.ual.dream_team_service.client.PlayerClient;
import es.ual.dream_team_service.domain.DreamTeam;
import es.ual.dream_team_service.dto.DreamTeamWithPlayersDTO;
import es.ual.dream_team_service.dto.PlayerNameDTO;
import es.ual.dream_team_service.dto.PlayerSummaryDTO;
import es.ual.dream_team_service.repository.DreamTeamRepository;
import es.ual.dream_team_service.client.GroqClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DreamTeamController {

    @Autowired
    private DreamTeamRepository repository;

    @Autowired
    private PlayerClient playerClient;

    @Autowired
    private GroqClient groqClient;

    private final String apiKey = System.getenv("GROQ_API_KEY");

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Operation(
        summary = "Get my dream teams",
        description = "Retrieves all dream teams belonging to the currently authenticated user."
    )
    @ApiResponse(
        responseCode = "200",
        description = "List of user's dream teams obtained",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "[" +
                "{" +
                    "\"id\": 1, \"name\": \"My All Stars\", \"userId\": \"user_123\", " +
                    "\"players\": [{\"id\": 1, \"name\": \"Neymar\"}, {\"id\": 4, \"name\": \"Cristiano Ronaldo\"}]" +
                "}" +
            "]")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @GetMapping(value = "/dream-teams", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DreamTeamWithPlayersDTO>> getAllDreamTeams(
            @Parameter(hidden = true) @RequestHeader(value = "X-User-ID", required = true) String userId) {
        List<DreamTeam> dreamTeams = repository.findByUserId(userId);
        List<DreamTeamWithPlayersDTO> response = dreamTeams.stream().map(dt -> {
            List<PlayerNameDTO> playerNames = dt.getPlayerIds().stream()
                .map(id -> {
                    try {
                        return playerClient.getPlayerName(id);
                    } catch (Exception e) {
                        return new PlayerNameDTO(id, "Unknown Player");
                    }
                })
                .collect(Collectors.toList());
            return new DreamTeamWithPlayersDTO(dt.getId(), dt.getName(), dt.getUserId(), playerNames);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Generate a new Dream Team with AI",
        description = "Uses an AI model to analyze the list of players and automatically select the 11 best players to form an ideal starting lineup."
    )
    @ApiResponse(
        responseCode = "201",
        description = "Dream Team generated successfully",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{" +
                "\"id\": 1, " +
                "\"name\": \"Champions XI\", " +
                "\"userId\": \"user_123\", " +
                "\"players\": [" +
                    "{\"id\": 1, \"name\": \"Neymar\"}, " +
                    "{\"id\": 2, \"name\": \"Cristiano Ronaldo\"}" +
                "]" +
            "}")
        )
    )
    @ApiResponse(
        responseCode = "500",
        description = "Error: AI service unavailable or parsing error",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"timestamp\": \"2026-05-28 14:30:00\", \"error\": \"Internal server error: Failed to generate Dream Team\"}")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @PostMapping(value = "/dream-teams", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DreamTeamWithPlayersDTO> createDreamTeamWithAI(
            @Parameter(hidden = true) 
            @RequestHeader(value = "X-User-ID", required = true) String userId) throws Exception {
        List<PlayerSummaryDTO> allPlayers = playerClient.getPlayersSummary();
        List<PlayerSummaryDTO> playersToSend = allPlayers.stream().limit(50).collect(Collectors.toList());
        String prompt = "You are an expert football coach. Your task is to generate a starting lineup of exactly 11 players from the provided list. " +
                "Players list: " + objectMapper.writeValueAsString(playersToSend) + ". " +
                "STRICT RULES: " +
                "1. If there are 11 or more players available, you MUST select exactly 11. " +
                "2. If there are fewer than 11 players available, select ALL of them. " +
                "3. If the list is empty, return an empty array for 'playerIds'. " +
                "4. 'name' must be a creative, engaging team name in Spanish. " +
                "5. Output format: You MUST return a valid JSON object matching the following example exactly. " +
                "6. PROHIBITED: Do not include markdown code blocks, do not include explanations, do not include prefixes or suffixes. " +
                "Only output the raw JSON string in this format: " +
                "{\"name\": \"La Furia Roja\", \"playerIds\": [1, 5, 12, 18, 22, 30, 41, 55, 62, 70, 88]}";
        Map<String, Object> request = Map.of(
            "model", "llama-3.1-8b-instant",
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.7,
            "max_completion_tokens", 1024
        );
        Map<String, Object> response = groqClient.getCompletion("Bearer " + apiKey, request);
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
        content = content.replaceAll("```json", "").replaceAll("```", "").trim();
        DreamTeam newTeam = objectMapper.readValue(content, DreamTeam.class);
        newTeam.setUserId(userId);
        newTeam.setCreatedAt(LocalDateTime.now());
        DreamTeam savedTeam = repository.save(newTeam);
        List<PlayerNameDTO> playerNames = savedTeam.getPlayerIds().stream()
            .map(id -> {
                try {
                    return playerClient.getPlayerName(id);
                } catch (Exception e) {
                    return new PlayerNameDTO(id, "Unknown Player");
                }
            })
            .collect(Collectors.toList());
        DreamTeamWithPlayersDTO responseDTO = new DreamTeamWithPlayersDTO(
            savedTeam.getId(), 
            savedTeam.getName(), 
            savedTeam.getUserId(), 
            playerNames
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }
}
