package es.ual.player_service.controller;

import es.ual.player_service.domain.Player;
import es.ual.player_service.repository.PlayerRepository;
import es.ual.player_service.exception.PlayerNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "players", description = "Player management API")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @Operation(summary = "Get players by filters", description = "Retrieves a list of players filtered by name, team or league, and creation date range")
    @ApiResponse(
        responseCode = "200",
        description = "Players list obtained",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 28, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68.00, \"number\": 10, \"team\": \"Paris Saint Germain\", \"league\": \"Ligue 1\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": 48.8566, \"longitude\": 2.3522, \"createdAt\": \"2026-05-27T12:00:00\"}]")
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
        summary = "Get player by ID", 
        description = "Retrieves a single player's details by its unique identifier."
    )
    @ApiResponse(
        responseCode = "200", 
        description = "Player found",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 28, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68.00, \"number\": 10, \"team\": \"Paris Saint Germain\", \"league\": \"Ligue 1\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": 48.8566, \"longitude\": 2.3522, \"createdAt\": \"2026-05-27T12:00:00\"}")
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
    public ResponseEntity<Player> getPlayerById(
            @Parameter(description = "Unique ID of the player to retrieve", required = true) 
            @PathVariable Long id) {
        return playerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new PlayerNotFoundException(HttpStatus.NOT_FOUND, "Player not found with id: " + id));
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
            examples = @ExampleObject(value = "{\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 28, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68.00, \"number\": 10, \"team\": \"Paris Saint Germain\", \"league\": \"Ligue 1\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": 48.8566, \"longitude\": 2.3522, \"createdAt\": \"2026-05-27T12:00:00\"}")
        )
    )
    @ApiResponse(
        responseCode = "401",
        description = "Error: Unauthorized"
    )
    @PostMapping(value = "/players", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Player> createPlayer(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Player object to be created",
                required = true,
                content = @Content(
                    examples = @ExampleObject(value = "{\"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 28, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68.00, \"number\": 10, \"team\": \"Paris Saint Germain\", \"league\": \"Ligue 1\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": 48.8566, \"longitude\": 2.3522}")
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
            examples = @ExampleObject(value = "{\"id\": 1, \"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 28, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68.00, \"number\": 10, \"team\": \"Paris Saint Germain\", \"league\": \"Ligue 1\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": 48.8566, \"longitude\": 2.3522, \"createdAt\": \"2026-05-27T12:00:00\"}")
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
        description = "Error: Unauthorized"
    )
    @ApiResponse(
        responseCode = "403",
        description = "Error: Forbidden"
    )
    @PutMapping(value = "/players/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Player> updatePlayer(
            @Parameter(description = "Unique ID of the player to update", required = true) 
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Updated player object",
                required = true,
                content = @Content(
                    examples = @ExampleObject(value = "{\"name\": \"Neymar\", \"firstName\": \"Neymar\", \"lastName\": \"da Silva Santos Júnior\", \"age\": 28, \"birthdate\": \"1992-02-05\", \"nationality\": \"Brazil\", \"height\": 1.75, \"weight\": 68.00, \"number\": 10, \"team\": \"Paris Saint Germain\", \"league\": \"Ligue 1\", \"position\": \"Attacker\", \"photoUrl\": \"https://media.api-sports.io/football/players/276.png\", \"latitude\": 48.8566, \"longitude\": 2.3522}")
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
        description = "Error: Unauthorized"
    )
    @ApiResponse(
        responseCode = "403",
        description = "Error: Forbidden"
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
}
