package es.ual.comment_service.controller;

import es.ual.comment_service.domain.Comment;
import es.ual.comment_service.repository.CommentRepository;
import es.ual.comment_service.dto.CommentRequest;
import es.ual.comment_service.exception.PlayerNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "comments", description = "Comment management API")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    @Qualifier("loadBalancedBuilder")
    private RestClient.Builder restClientBuilder;

    private void checkPlayerExists(Long id) {
        try {
            restClientBuilder.build().get()
                .uri("http://player-service/api/players/{id}", id)
                .retrieve()
                .toBodilessEntity();
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new PlayerNotFoundException(HttpStatus.NOT_FOUND, "Player not found with id: " + id);
        } catch (Exception e) {
            throw new RuntimeException("Service temporarily unavailable");
        }
    }

    @Operation(
        summary = "Get comments by player ID",
        description = "Retrieves a list of all comments associated with a specific player."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Comments list obtained",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "[{\"id\": 1, \"userId\": \"firebase_uid_123\", \"playerId\": 1, \"author\": \"user@example.com\", \"text\": \"Amazing player!\", \"rating\": 5, \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}]")
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
    @GetMapping(value = "/comments/player/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Comment>> getCommentsByPlayer(
            @Parameter(description = "Unique ID of the player to retrieve comments for", required = true) 
            @PathVariable Long id) {
        checkPlayerExists(id);
        List<Comment> comments = commentRepository.findByPlayerId(id);
        return ResponseEntity.ok(comments);
    }

@Operation(
        summary = "Create a new comment",
        description = "Creates a comment for a player. If not authenticated, user is set as null and author as 'anonymous'."
    )
    @ApiResponse(
        responseCode = "201",
        description = "Comment created successfully",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "{\"id\": 1, \"userId\": null, \"playerId\": 1, \"author\": \"anonymous\", \"text\": \"Amazing player!\", \"rating\": 5, \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}")
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
    @PostMapping(value = "/comments/player/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Comment> createComment(
            @Parameter(description = "Unique ID of the player to comment on", required = true)
            @PathVariable Long id,
            @Parameter(hidden = true)
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @Parameter(hidden = true)
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Comment content",
                required = true,
                content = @Content(
                    examples = @ExampleObject(value = "{\"text\": \"Amazing player!\", \"rating\": 5, \"latitude\": -23.944841, \"longitude\": -46.330376}")
                )
            )
            @RequestBody CommentRequest req) {
        checkPlayerExists(id);
        Comment comment = new Comment();
        comment.setPlayerId(id);
        if (userId != null && !userId.isEmpty() && userEmail != null && !userEmail.isEmpty()) {
            comment.setUserId(userId);
            comment.setAuthor(userEmail);
        } else {
            comment.setUserId(null);
            comment.setAuthor("anonymous");
        }
        comment.setText(req.text());
        comment.setRating(req.rating() != null ? req.rating().byteValue() : 0);
        comment.setLatitude(req.latitude() != null ? BigDecimal.valueOf(req.latitude()) : null);
        comment.setLongitude(req.longitude() != null ? BigDecimal.valueOf(req.longitude()) : null);
        comment.setCreatedAt(LocalDateTime.now());
        return new ResponseEntity<>(commentRepository.save(comment), HttpStatus.CREATED);
    }
}
