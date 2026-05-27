package es.ual.player_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import es.ual.player_service.domain.Player;
import es.ual.player_service.repository.PlayerRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api")
@Tag(name = "players", description = "Player management API")
public class PlayerController {
    @Autowired
    private PlayerRepository playerRepository;
    
	@Operation(summary = "Get all players", description = "Retrieves a list of all registered players")
	@ApiResponse(
		responseCode = "200", 
		description = "Players list obtained",
		content = @Content(
			mediaType = "application/json",
			examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Cristiano Ronaldo\", \"age\": 41}]")
		)
	)
	@GetMapping(value = "/players", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Iterable<Player>> getPlayers() {
		return ResponseEntity.ok(playerRepository.findAll());
	}

	@Operation(summary = "Get all players", description = "Retrieves a list of all registered players")
	@ApiResponse(
		responseCode = "200", 
		description = "Players list obtained",
		content = @Content(
			mediaType = "application/json",
			examples = @ExampleObject(value = "[{\"id\": 1, \"name\": \"Cristiano Ronaldo\", \"age\": 41}]")
		)
	)
	@GetMapping(value = "/players2", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Iterable<Player>> getPlayers2() {
		return ResponseEntity.ok(playerRepository.findAll());
	}
}
