package es.ual.player_service.controller;

import es.ual.player_service.domain.Player;
import es.ual.player_service.repository.PlayerRepository;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "players", description = "Player management API")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @Operation(summary = "Get players by filters", description = "Retrieves a list of players filtered by name, team/league or creation date range")
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
            
            @Parameter(description = "Start date filter (ISO format: yyyy-MM-dd'T'HH:mm:ss)") 
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateStart,
            
            @Parameter(description = "End date filter (ISO format: yyyy-MM-dd'T'HH:mm:ss)") 
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEnd) {

        List<Player> players = playerRepository.findByFilters(query, dateStart, dateEnd);
        return ResponseEntity.ok(players);
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
}
