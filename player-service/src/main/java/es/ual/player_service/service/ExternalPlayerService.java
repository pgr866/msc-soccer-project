package es.ual.player_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.ual.player_service.client.FootballApiClient;
import es.ual.player_service.dto.ExternalPlayerDTO;
import es.ual.player_service.domain.Player;
import es.ual.player_service.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExternalPlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private FootballApiClient footballApiClient;

    @Autowired
    private ObjectMapper objectMapper;

    private final String apiKey = System.getenv("FOOTBALL_API_KEY");

    private LocalDate parseExternalDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            String[] parts = dateStr.split("-");
            String year = parts[0];
            String month = String.format("%02d", Integer.parseInt(parts[1]));
            String day = String.format("%02d", Integer.parseInt(parts[2]));
            return LocalDate.parse(year + "-" + month + "-" + day);
        }
    }

    public List<ExternalPlayerDTO> searchPlayers(String searchParam) throws Exception {
        String jsonResponse = footballApiClient.searchPlayers(apiKey, searchParam, null);
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode playersNode = root.get("response");
        List<ExternalPlayerDTO> results = new ArrayList<>();
        for (JsonNode item : playersNode) {
            JsonNode p = item.get("player");
            JsonNode hNode = p.get("height");
            Double height = (hNode != null && !hNode.isNull()) ? Double.parseDouble(hNode.asText().replaceAll("[^0-9]", "")) / 100.0 : null;
            JsonNode wNode = p.get("weight");
            Double weight = (wNode != null && !wNode.isNull()) ? Double.parseDouble(wNode.asText().replaceAll("[^0-9]", "")) : null;
            JsonNode bNode = p.at("/birth/date");
            LocalDate birthdate = (bNode != null && !bNode.isNull() && !bNode.asText().isEmpty()) ? parseExternalDate(bNode.asText()) : null;
            results.add(new ExternalPlayerDTO(
                p.get("id").asLong(),
                p.get("name").asText(),
                p.get("firstname").asText(null),
                p.get("lastname").asText(null),
                p.hasNonNull("age") ? p.get("age").asInt() : null,
                birthdate,
                p.get("nationality").asText(null),
                height,
                weight,
                p.hasNonNull("number") ? p.get("number").asInt() : null,
                p.get("position").asText(null),
                p.get("photo").asText(null)
            ));
        }
        return results;
    }

    public Player importAndSavePlayer(Long playerId, Double latitude, Double longitude) throws Exception {
        int currentYear = LocalDate.now().getYear();
        String profileJson = footballApiClient.searchPlayers(apiKey, null, playerId);
        JsonNode playerItem = objectMapper.readTree(profileJson).get("response").get(0);
        JsonNode p = playerItem.get("player");
        Double height = (p.hasNonNull("height")) ? Double.parseDouble(p.get("height").asText().replaceAll("[^0-9]", "")) / 100.0 : null;
        Double weight = (p.hasNonNull("weight")) ? Double.parseDouble(p.get("weight").asText().replaceAll("[^0-9]", "")) : null;
        LocalDate birthdate = (p.at("/birth/date") != null && !p.at("/birth/date").isNull()) ? parseExternalDate(p.at("/birth/date").asText()) : null;
        ExternalPlayerDTO ep = new ExternalPlayerDTO(
            p.get("id").asLong(), p.get("name").asText(), p.get("firstname").asText(null), 
            p.get("lastname").asText(null), p.hasNonNull("age") ? p.get("age").asInt() : null,
            birthdate, p.get("nationality").asText(null), height, weight,
            p.hasNonNull("number") ? p.get("number").asInt() : null, p.get("position").asText(null), p.get("photo").asText(null)
        );

        String teamsJson = footballApiClient.getPlayerTeams(apiKey, ep.id());
        JsonNode teamsResponse = objectMapper.readTree(teamsJson).get("response");
        String teamName = null;
        String leagueName = null;
        Long teamId = null;
        int[] yearsToTry = {currentYear, currentYear - 1};
        for (int year : yearsToTry) {
            boolean foundInYear = false;
            for (JsonNode t : teamsResponse) {
                JsonNode teamNode = t.get("team");
                JsonNode seasonsNode = t.get("seasons");
                boolean hasYear = false;
                for (JsonNode season : seasonsNode) {
                    if (season.asInt() == year) {
                        hasYear = true;
                        break;
                    }
                }
                if (hasYear && !teamNode.get("name").asText().contains(ep.nationality())) {
                    teamName = teamNode.get("name").asText();
                    teamId = teamNode.get("id").asLong();
                    foundInYear = true;
                    break;
                }
            }
            if (foundInYear) break;
        }

        if (teamId != null) {
            String leaguesJson = footballApiClient.getLeaguesByTeam(apiKey, teamId);
            JsonNode leaguesResponse = objectMapper.readTree(leaguesJson).get("response");
            long maxDuration = -1;
            for (JsonNode l : leaguesResponse) {
                JsonNode league = l.get("league");
                if ("League".equals(league.get("type").asText()) && !"World".equals(l.get("country").get("name").asText())) {
                    for (JsonNode s : l.get("seasons")) {
                        int seasonYear = s.get("year").asInt();
                        if (seasonYear == currentYear || seasonYear == currentYear - 1) {
                            LocalDate start = parseExternalDate(s.get("start").asText());
                            LocalDate end = parseExternalDate(s.get("end").asText());
                            long duration = java.time.temporal.ChronoUnit.DAYS.between(start, end);
                            if (duration > maxDuration) {
                                maxDuration = duration;
                                leagueName = league.get("name").asText();
                            }
                        }
                    }
                }
            }
        }

        Byte age = (ep.age() != null) ? ep.age().byteValue() : null;
        Byte number = (ep.number() != null) ? ep.number().byteValue() : null;
        BigDecimal h = (ep.height() != null) ? BigDecimal.valueOf(ep.height()) : null;
        BigDecimal w = (ep.weight() != null) ? BigDecimal.valueOf(ep.weight()) : null;
        BigDecimal lat = BigDecimal.valueOf(latitude);
        BigDecimal lon = BigDecimal.valueOf(longitude);
        Player player = new Player();
        player.setName(ep.name());
        player.setFirstName(ep.firstName());
        player.setLastName(ep.lastName());
        player.setAge(age);
        player.setBirthdate(ep.birthdate());
        player.setNationality(ep.nationality());
        player.setHeight(h);
        player.setWeight(w);
        player.setNumber(number);
        player.setPosition(ep.position());
        player.setPhotoUrl(ep.photoUrl());
        player.setTeam(teamName);
        player.setLeague(leagueName);
        player.setLatitude(lat);
        player.setLongitude(lon);
        player.setCreatedAt(LocalDateTime.now());
        playerRepository.save(player);
        return player;
    }
}
