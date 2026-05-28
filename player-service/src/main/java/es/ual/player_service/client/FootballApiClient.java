package es.ual.player_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "football-api", url = "https://v3.football.api-sports.io")
public interface FootballApiClient {

    @GetMapping("/players/profiles")
    String searchPlayers(
            @RequestHeader("x-rapidapi-key") String apiKey,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long player);

    @GetMapping("/players/teams")
    String getPlayerTeams(
            @RequestHeader("x-rapidapi-key") String apiKey,
            @RequestParam("player") Long playerId);

    @GetMapping("/leagues")
    String getLeaguesByTeam(
            @RequestHeader("x-rapidapi-key") String apiKey,
            @RequestParam("team") Long teamId);
}
