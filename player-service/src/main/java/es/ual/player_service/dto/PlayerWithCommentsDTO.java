package es.ual.player_service.dto;

import es.ual.player_service.domain.Player;
import java.util.List;

public record PlayerWithCommentsDTO(
    Player player,
    List<CommentDTO> comments
) {}
