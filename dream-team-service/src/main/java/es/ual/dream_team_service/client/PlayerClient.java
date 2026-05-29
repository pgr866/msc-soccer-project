package es.ual.dream_team_service.client;

import es.ual.dream_team_service.dto.PlayerNameDTO;
import es.ual.dream_team_service.dto.PlayerSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "player-service")
public interface PlayerClient {
    @GetMapping("/api/players/name/{id}")
    PlayerNameDTO getPlayerName(@PathVariable("id") Long id);

    @GetMapping("/api/players/summary") 
    List<PlayerSummaryDTO> getPlayersSummary();
}
