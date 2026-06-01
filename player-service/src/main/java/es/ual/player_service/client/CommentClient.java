package es.ual.player_service.client;

import es.ual.player_service.dto.CommentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "comment-service", url = "${COMMENT_SERVICE_URL:http://localhost:8082}")
public interface CommentClient {
    @GetMapping(value = "/api/comments/player/{id}")
    List<CommentDTO> getCommentsByPlayerId(@PathVariable("id") Long id);
}
