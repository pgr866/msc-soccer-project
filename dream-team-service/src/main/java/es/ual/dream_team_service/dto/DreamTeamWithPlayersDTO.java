package es.ual.dream_team_service.dto;

import es.ual.dream_team_service.dto.PlayerNameDTO;
import java.util.List;

public record DreamTeamWithPlayersDTO(
    Long id,
    String name,
    String userId,
    List<PlayerNameDTO> players
) {}
