package es.ual.player_service.dto;

import java.util.List;

public record PlayersImportRequestDTO(
    List<Long> playerIds,
    Double latitude,
    Double longitude
) {}
