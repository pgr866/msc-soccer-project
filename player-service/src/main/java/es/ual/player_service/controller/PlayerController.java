package es.ual.player_service.controller;

import es.ual.player_service.domain.Player;
import es.ual.player_service.dto.ExternalPlayerDTO;
import es.ual.player_service.dto.PlayersImportRequestDTO;
import es.ual.player_service.dto.CommentDTO;
import es.ual.player_service.dto.PlayerWithCommentsDTO;
import es.ual.player_service.repository.PlayerRepository;
import es.ual.player_service.client.CommentClient;
import es.ual.player_service.service.ExternalPlayerService;
import es.ual.player_service.exception.PlayerNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@Tag(name = "players", description = "Player management API")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private CommentClient commentClient;

    @Autowired
    private ExternalPlayerService externalPlayerService;

    @Operation(
        summary = "Get players by filters",
        description = "Retrieves a list of players filtered by name, team or league, and creation date range"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Players list obtained",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"team\": \"Santos\", \"league\": \"Serie A\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}]")
        )
    )
    @GetMapping(value = "/players", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Player>> getPlayers(
            @Parameter(description = "Search term for name, team or league") 
            @RequestParam(required = false) String query,
            
            @Parameter(description = "Start date filter (Format: yyyy-MM-dd)") 
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateStart,
            
            @Parameter(description = "End date filter (Format: yyyy-MM-dd)") 
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateEnd) {
        List<Player> players = playerRepository.findByFilters(query, dateStart, dateEnd);
        return ResponseEntity.ok(players);
    }

    @Operation(
        summary = "Get player by ID with comments",
        description = "Retrieves a player's details along with all associated comments."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Player and comments found",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{" +
                "\"player\": {\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"team\": \"Santos\", \"league\": \"Serie A\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}," +
                "\"comments\": [{\"id\": 1, \"userId\": null, \"playerId\": 1, \"author\": \"anonymous\", \"text\": \"Amazing player!\", \"rating\": 5, \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}]" +
                "}")
        )
    )
    @ApiResponse(
        responseCode = "404",
        description = "Error: Player not found",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"timestamp\": \"2026-05-27 12:00:00\", \"error\": \"Player not found with id: 1\"}")
        )
    )
    @GetMapping(value = "/players/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PlayerWithCommentsDTO> getPlayerById(@PathVariable Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException(HttpStatus.NOT_FOUND, "Player not found"));
        List<CommentDTO> comments;
        try {
            comments = commentClient.getCommentsByPlayerId(id);
        } catch (Exception e) {
            comments = List.of(); 
        }
        return ResponseEntity.ok(new PlayerWithCommentsDTO(player, comments));
    }

    @Operation(
        summary = "Create a new player",
        description = "Registers a new player in the system. The 'createdAt' field is set automatically by the server."
    )
    @ApiResponse(
        responseCode = "201",
        description = "Player created successfully",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"team\": \"Santos\", \"league\": \"Serie A\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @PostMapping(value = "/players", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Player> createPlayer(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Player object to be created",
                required = true,
                content = @Content(
                    examples = @ExampleObject(value = "{\"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"team\": \"Santos\", \"league\": \"Serie A\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": -23.944841, \"longitude\": -46.330376}")
                )
            )
            @Valid @RequestBody Player player) {
        player.setCreatedAt(LocalDateTime.now());
        Player savedPlayer = playerRepository.save(player);
        return new ResponseEntity<>(savedPlayer, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Update an existing player",
        description = "Updates all fields of a player. The 'createdAt' field is preserved."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Player updated successfully",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"team\": \"Santos\", \"league\": \"Serie A\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}")
        )
    )
    @ApiResponse(
        responseCode = "404",
        description = "Error: Player not found",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"timestamp\": \"2026-05-27 12:00:00\", \"error\": \"Player not found with id: 1\"}")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @ApiResponse(
        responseCode = "403",
        description = "Error: Forbidden",
        content = @Content(schema = @Schema(hidden = true))
    )
    @PutMapping(value = "/players/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Player> updatePlayer(
            @Parameter(description = "Unique ID of the player to update", required = true) 
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Updated player object",
                required = true,
                content = @Content(
                    examples = @ExampleObject(value = "{\"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"team\": \"Santos\", \"league\": \"Serie A\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": -23.944841, \"longitude\": -46.330376}")
                )
            )
            @Valid @RequestBody Player playerDetails) {
        return playerRepository.findById(id)
                .map(existingPlayer -> {
                    existingPlayer.setName(playerDetails.getName());
                    existingPlayer.setFirstName(playerDetails.getFirstName());
                    existingPlayer.setLastName(playerDetails.getLastName());
                    existingPlayer.setAge(playerDetails.getAge());
                    existingPlayer.setBirthdate(playerDetails.getBirthdate());
                    existingPlayer.setNationality(playerDetails.getNationality());
                    existingPlayer.setHeight(playerDetails.getHeight());
                    existingPlayer.setWeight(playerDetails.getWeight());
                    existingPlayer.setNumber(playerDetails.getNumber());
                    existingPlayer.setTeam(playerDetails.getTeam());
                    existingPlayer.setLeague(playerDetails.getLeague());
                    existingPlayer.setPosition(playerDetails.getPosition());
                    existingPlayer.setPhotoUrl(playerDetails.getPhotoUrl());
                    existingPlayer.setLatitude(playerDetails.getLatitude());
                    existingPlayer.setLongitude(playerDetails.getLongitude());
                    Player updatedPlayer = playerRepository.save(existingPlayer);
                    return ResponseEntity.ok(updatedPlayer);
                })
                .orElseThrow(() -> new PlayerNotFoundException(HttpStatus.NOT_FOUND, "Player not found with id: " + id));
    }

    @Operation(
        summary = "Delete a player",
        description = "Removes a player from the system by its unique identifier."
    )
    @ApiResponse(
        responseCode = "204",
        description = "Player deleted successfully"
    )
    @ApiResponse(
        responseCode = "404",
        description = "Error: Player not found",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"timestamp\": \"2026-05-27 12:00:00\", \"error\": \"Player not found with id: 1\"}")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @ApiResponse(
        responseCode = "403",
        description = "Error: Forbidden",
        content = @Content(schema = @Schema(hidden = true))
    )
    @DeleteMapping(value = "/players/{id}")
    public ResponseEntity<Void> deletePlayer(
            @Parameter(description = "Unique ID of the player to delete", required = true) 
            @PathVariable Long id) {
        if (!playerRepository.existsById(id)) {
            throw new PlayerNotFoundException(HttpStatus.NOT_FOUND, "Player not found with id: " + id);
        }
        playerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Search players in external API",
        description = "Searches for players in the external football API. Requires a minimum of 3 characters for the query parameter."
    )
    @ApiResponse(
        responseCode = "200",
        description = "List of external players found",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "[{\"id\": 276, \"name\": \"Neymar\", \"first_name\": \"Neymar\", \"last_name\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"position\": \"Attacker\", \"photo_url\": \"https://media.api-sports.io/football/players/276.png\"}]")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @ApiResponse(
        responseCode = "403",
        description = "Error: Forbidden",
        content = @Content(schema = @Schema(hidden = true))
    )
    @GetMapping("/players/search")
    public ResponseEntity<List<ExternalPlayerDTO>> searchExternalPlayers(
            @Parameter(description = "Search term (min. 3 characters)")
            @RequestParam(required = false) String query) throws Exception {
        String searchParam = (query != null && query.length() >= 3) ? query : null;
        return ResponseEntity.ok(externalPlayerService.searchPlayers(searchParam));
    }

    @Operation(
        summary = "Import players from external API",
        description = "Fetches details of multiple players by their IDs from an external API, resolves their current active team and league, and saves them into the local database."
    )
    @ApiResponse(
        responseCode = "201",
        description = "Players imported and created successfully",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "[" +
                "{" +
                    "\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 34, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68, \"number\": 10, \"team\": \"Santos\", \"league\": \"Serie A\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"" +
                "}," +
                "{" +
                    "\"id\": 2, \"name\": \"Cristiano Ronaldo\", \"firstName\": \"Cristiano Ronaldo\", \"lastName\": \"dos Santos Aveiro\", \"age\": 41, \"birthdate\": \"1985-02-05\", \"nationality\": \"Portugal\", \"height\": 1.87, \"weight\": 83, \"number\": 7, \"team\": \"Al-Nassr\", \"league\": \"Pro League\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/874.png\", \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"" +
                "}" +
            "]")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized",
        content = @Content(schema = @Schema(hidden = true))
    )
    @PostMapping(value = "/players/import", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Player>> importPlayers(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "List of player IDs to import with coordinates",
                required = true,
                content = @Content(
                    examples = @ExampleObject(value = "{\"playerIds\": [276, 874], \"latitude\": -23.944841, \"longitude\": -46.330376}")
                )
            )
            @Valid @RequestBody PlayersImportRequestDTO request) {
        List<Player> importedPlayers = new ArrayList<>();
        for (Long playerId : request.playerIds()) {
            try {
                importedPlayers.add(externalPlayerService.importAndSavePlayer(playerId, request.latitude(), request.longitude()));
            } catch (Exception e) {
                System.err.println("Error importing player with Id " + playerId + ": " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(importedPlayers);
    }
}
