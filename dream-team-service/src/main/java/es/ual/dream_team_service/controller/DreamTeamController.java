package es.ual.dream_team_service.controller;

import es.ual.dream_team_service.client.PlayerClient;
import es.ual.dream_team_service.domain.DreamTeam;
import es.ual.dream_team_service.dto.DreamTeamWithPlayersDTO;
import es.ual.dream_team_service.dto.PlayerNameDTO;
import es.ual.dream_team_service.dto.PlayerSummaryDTO;
import es.ual.dream_team_service.repository.DreamTeamRepository;
import es.ual.dream_team_service.service.DreamTeamService;
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
import org.springframework.web.server.ResponseStatusException;

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

    @Autowired
    private DreamTeamService dreamTeamService;

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
    @ApiResponse(
        responseCode = "500",
        description = "Error: Internal Server Error",
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
        responseCode = "422",
        description = "Error: Unprocessable Entity",
        content = @Content(schema = @Schema(hidden = true))
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @ApiResponse(
        responseCode = "500",
        description = "Error: Internal Server Error",
        content = @Content(schema = @Schema(hidden = true))
    )
    @PostMapping(value = "/dream-teams", produces = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<DreamTeamWithPlayersDTO> createDreamTeamWithAI(
            @Parameter(hidden = true) 
            @RequestHeader(value = "X-User-ID", required = true) String userId) throws Exception {
        DreamTeam savedTeam = dreamTeamService.generateAndSaveDreamTeam(userId);
        if (savedTeam.getPlayerIds() == null || savedTeam.getPlayerIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Failed to generate team");
        }
        List<PlayerNameDTO> playerNames = savedTeam.getPlayerIds().stream()
            .map(id -> {
                try { return playerClient.getPlayerName(id); } 
                catch (Exception e) { return new PlayerNameDTO(id, "Unknown Player"); }
            })
            .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new DreamTeamWithPlayersDTO(savedTeam.getId(), savedTeam.getName(), userId, playerNames));
    }
}
