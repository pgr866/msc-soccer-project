package es.ual.dream_team_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.ual.dream_team_service.client.GroqClient;
import es.ual.dream_team_service.client.PlayerClient;
import es.ual.dream_team_service.domain.DreamTeam;
import es.ual.dream_team_service.dto.PlayerSummaryDTO;
import es.ual.dream_team_service.repository.DreamTeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DreamTeamServiceTest {

    @Mock
    private DreamTeamRepository repository;
    @Mock
    private GroqClient groqClient;
    @Mock
    private PlayerClient playerClient;

    private DreamTeamService dreamTeamService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        dreamTeamService = new DreamTeamService(repository, groqClient, playerClient, objectMapper, "dummy-key");
    }

    private PlayerSummaryDTO createDummyPlayer(Long id, String name) {
        return new PlayerSummaryDTO(id, name, "Forward", "Team", "League", (byte) 25, BigDecimal.ONE, BigDecimal.TEN);
    }

    @Test
    void shouldGenerateAndSaveDreamTeamSuccessfully() throws Exception {
        PlayerSummaryDTO p1 = createDummyPlayer(1L, "Neymar");
        when(playerClient.getPlayersSummary()).thenReturn(List.of(p1));
        String jsonResponse = "{\"name\": \"Champions XI\", \"playerIds\": [1]}";
        Map<String, Object> mockGroqResponse = Map.of(
            "choices", List.of(Map.of("message", Map.of("content", jsonResponse)))
        );
        when(groqClient.getCompletion(anyString(), any())).thenReturn(mockGroqResponse);
        when(repository.save(any(DreamTeam.class))).thenAnswer(i -> i.getArguments()[0]);
        DreamTeam result = dreamTeamService.generateAndSaveDreamTeam("user_123");
        assertThat(result.getName()).isEqualTo("Champions XI");
        assertThat(result.getUserId()).isEqualTo("user_123");
        verify(repository, times(1)).save(any(DreamTeam.class));
    }

    @Test
    void shouldThrowExceptionWhenNoPlayersAvailable() {
        when(playerClient.getPlayersSummary()).thenReturn(List.of());
        assertThrows(ResponseStatusException.class, () -> 
            dreamTeamService.generateAndSaveDreamTeam("user_123")
        );
    }

    @Test
    void shouldThrowExceptionWhenAiReturnsNoPlayers() throws Exception {
        when(playerClient.getPlayersSummary()).thenReturn(List.of(createDummyPlayer(1L, "Neymar")));
        String jsonResponse = "{\"name\": \"Empty Team\", \"playerIds\": []}";
        Map<String, Object> mockGroqResponse = Map.of(
            "choices", List.of(Map.of("message", Map.of("content", jsonResponse)))
        );
        when(groqClient.getCompletion(anyString(), any())).thenReturn(mockGroqResponse);
        assertThrows(ResponseStatusException.class, () -> 
            dreamTeamService.generateAndSaveDreamTeam("user_123")
        );
    }
}
