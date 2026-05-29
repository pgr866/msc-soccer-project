package es.ual.dream_team_service.dto;

import java.math.BigDecimal;

public record PlayerSummaryDTO(
    Long id,
    String name,
    String position,
    String team,
    String league,
    Byte age,
    BigDecimal height,
    BigDecimal weight
) {}
