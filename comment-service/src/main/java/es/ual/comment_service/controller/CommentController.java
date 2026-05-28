package es.ual.comment_service.controller;

import es.ual.comment_service.domain.Comment;
import es.ual.comment_service.repository.CommentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "comments", description = "Comment management API")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Operation(
        summary = "Get comments by player ID",
        description = "Retrieves a list of all comments associated with a specific player."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Comments list obtained",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            examples = @ExampleObject(value = "[{\"id\": 1, \"userId\": \"firebase_uid_123\", \"playerId\": 1, \"author\": \"user@example.com\", \"text\": \"Great performance!\", \"rating\": 5, \"latitude\": -23.944841, \"longitude\": -46.330376, \"createdAt\": \"2026-05-27T12:00:00\"}]")
        )
    )
    @GetMapping(value = "/comments/player/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Comment>> getCommentsByPlayer(
            @Parameter(description = "Unique ID of the player to retrieve comments for", required = true) 
            @PathVariable Long id) {
        List<Comment> comments = commentRepository.findByPlayerId(id);
        return ResponseEntity.ok(comments);
    }
}
