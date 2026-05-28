package es.ual.player_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CommentDTO(
    Long id,
    String userId,
    Long playerId,
    String author,
    String text,
    Byte rating,
    BigDecimal latitude,
    BigDecimal longitude,
    LocalDateTime createdAt
) {}
