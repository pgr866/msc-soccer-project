package es.ual.dream_team_service.controller;

import es.ual.dream_team_service.client.PlayerClient;
import es.ual.dream_team_service.domain.DreamTeam;
import es.ual.dream_team_service.dto.DreamTeamResponseDTO;
import es.ual.dream_team_service.dto.PlayerNameDTO;
import es.ual.dream_team_service.repository.DreamTeamRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dream-teams")
public class DreamTeamController {

    @Autowired
    private DreamTeamRepository repository;

    @Autowired
    private PlayerClient playerClient;

    @Operation(
        summary = "Get all dream teams",
        description = "Retrieves all dream teams with their associated players (ID and Name only)."
    )
    @ApiResponse(
        responseCode = "200",
        description = "List of dream teams obtained",
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
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DreamTeamResponseDTO>> getAllDreamTeams() {
        List<DreamTeam> dreamTeams = repository.findAll();
        List<DreamTeamResponseDTO> response = dreamTeams.stream().map(dt -> {
            List<PlayerNameDTO> playerNames = dt.getPlayerIds().stream()
                .map(id -> {
                    try {
                        return playerClient.getPlayerName(id);
                    } catch (Exception e) {
                        return new PlayerNameDTO(id, "Unknown Player");
                    }
                })
                .collect(Collectors.toList());
            return new DreamTeamResponseDTO(dt.getId(), dt.getName(), dt.getUserId(), playerNames);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
