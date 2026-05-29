package es.ual.player_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.ual.player_service.client.FootballApiClient;
import es.ual.player_service.domain.Player;
import es.ual.player_service.repository.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExternalPlayerServiceTest {

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private FootballApiClient footballApiClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ExternalPlayerService externalPlayerService;

    // JSON simulado de respuesta de la API (lo inyectamos como String para no crear archivos)
    private final String mockSearchResponse = "{"
            + "\"response\": [{"
            + "  \"player\": {\"id\": 276, \"name\": \"Neymar\", \"firstname\": \"Neymar\", \"lastname\": \"Santos\", \"age\": 34, \"birth\": {\"date\": \"1992-02-05\"}, \"nationality\": \"Brazil\", \"height\": \"175 cm\", \"weight\": \"68 kg\", \"number\": 10, \"position\": \"Attacker\", \"photo\": \"url\"}"
            + "}]}";

    @Test
    void shouldSearchPlayersSuccessfully() throws Exception {
        // GIVEN
        when(footballApiClient.searchPlayers(any(), eq("Neymar"), isNull()))
                .thenReturn(mockSearchResponse);

        // WHEN
        var results = externalPlayerService.searchPlayers("Neymar");

        // THEN
        assertFalse(results.isEmpty());
        assertEquals("Neymar", results.get(0).name());
        assertEquals(1.75, results.get(0).height());
        assertEquals(68.0, results.get(0).weight());
        verify(footballApiClient).searchPlayers(any(), eq("Neymar"), isNull());
    }

    @Test
    void shouldImportAndSavePlayerSuccessfully() throws Exception {
        // GIVEN: Simulación de respuesta de perfil y equipos
        String profileJson = "{\"response\": [{\"player\": {\"id\": 276, \"name\": \"Neymar\", \"firstname\": \"Neymar\", \"lastname\": \"Santos\", \"age\": 34, \"birth\": {\"date\": \"1992-02-05\"}, \"nationality\": \"Brazil\", \"height\": \"175 cm\", \"weight\": \"68 kg\", \"number\": 10, \"position\": \"Attacker\", \"photo\": \"url\"}}]}";
        String teamsJson = "{\"response\": [{\"team\": {\"id\": 1, \"name\": \"Santos\"}, \"seasons\": [2026]}]}";
        String leaguesJson = "{\"response\": [{\"league\": {\"id\": 1, \"name\": \"Serie A\", \"type\": \"League\"}, \"country\": {\"name\": \"Brazil\"}, \"seasons\": [{\"year\": 2026, \"start\": \"2026-01-01\", \"end\": \"2026-12-01\"}]}]}";

        when(footballApiClient.searchPlayers(any(), isNull(), eq(276L))).thenReturn(profileJson);
        when(footballApiClient.getPlayerTeams(any(), eq(276L))).thenReturn(teamsJson);
        when(footballApiClient.getLeaguesByTeam(any(), eq(1L))).thenReturn(leaguesJson);
        when(playerRepository.save(any(Player.class))).thenAnswer(i -> i.getArguments()[0]);

        // WHEN
        Player player = externalPlayerService.importAndSavePlayer(276L, -23.9, -46.3);

        // THEN
        assertNotNull(player);
        assertEquals("Neymar", player.getName());
        assertEquals("Santos", player.getTeam());
        assertEquals("Serie A", player.getLeague());
        verify(playerRepository).save(any(Player.class));
    }
}
