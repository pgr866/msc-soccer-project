package es.ual.player_service.controller;

import es.ual.player_service.client.CommentClient;
import es.ual.player_service.domain.Player;
import es.ual.player_service.repository.PlayerRepository;
import es.ual.player_service.service.ExternalPlayerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
})
@Testcontainers
class PlayerControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @Autowired
    private PlayerRepository playerRepository;

    @MockitoBean
    private CommentClient commentClient;

    @MockitoBean
    private ExternalPlayerService externalPlayerService;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
        playerRepository.deleteAll();
    }

    @Test
    void shouldReturnAllPlayers() throws Exception {
        mockMvc.perform(get("/api/players").contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());
    }

    @Test
    void shouldGetPlayerById_WithComments() throws Exception {
        Player p = playerRepository.save(createBasePlayer("Neymar"));
        when(commentClient.getCommentsByPlayerId(anyLong())).thenReturn(java.util.List.of());
        mockMvc.perform(get("/api/players/" + p.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.player.name").value("Neymar"))
            .andExpect(jsonPath("$.comments").isEmpty());
    }

    @Test
    void shouldHandleCommentServiceFailure_Gracefully() throws Exception {
        Player p = playerRepository.save(createBasePlayer("Neymar"));
        when(commentClient.getCommentsByPlayerId(p.getId())).thenThrow(new RuntimeException("API Down"));
        mockMvc.perform(get("/api/players/" + p.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.comments").isEmpty());
    }

    @Test
    void shouldReturn404_WhenPlayerNotFound() throws Exception {
        mockMvc.perform(get("/api/players/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreatePlayerSuccessfully() throws Exception {
        String playerJson = "{\"name\": \"Messi\", \"latitude\": 0, \"longitude\": 0}";
        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Messi"));
    }

    @Test
    void shouldReturn400_WhenCreatingPlayerWithInvalidData() throws Exception {
        String invalidPlayerJson = "{\"name\": \"\", \"latitude\": 0, \"longitude\": 0}";
        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPlayerJson))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDeletePlayerSuccessfully() throws Exception {
        Player p = playerRepository.save(createBasePlayer("Trash"));
        mockMvc.perform(delete("/api/players/" + p.getId()))
            .andExpect(status().isNoContent());
    }

    @Test
    void shouldUpdatePlayerSuccessfully() throws Exception {
        Player p = playerRepository.save(createBasePlayer("OldName"));
        String updateJson = "{\"name\": \"NewName\", \"latitude\": 0, \"longitude\": 0}";
        mockMvc.perform(put("/api/players/" + p.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("NewName"));
    }

    @Test
    void shouldReturnSummaryList() throws Exception {
        playerRepository.save(createBasePlayer("Neymar"));
        mockMvc.perform(get("/api/players/summary"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Neymar"));
    }

    @Test
    void shouldSearchExternalPlayers_WhenQueryIsValid() throws Exception {
        when(externalPlayerService.searchPlayers("Neymar")).thenReturn(java.util.List.of());
        mockMvc.perform(get("/api/players/search?query=Neymar"))
            .andExpect(status().isOk());
        verify(externalPlayerService).searchPlayers("Neymar");
    }

    @Test
    void shouldNotSearchExternalPlayers_WhenQueryIsTooShort() throws Exception {
        when(externalPlayerService.searchPlayers(null)).thenReturn(java.util.List.of());
        mockMvc.perform(get("/api/players/search?query=Ne"))
            .andExpect(status().isOk());
        verify(externalPlayerService).searchPlayers(null);
    }

    @Test
    void shouldImportPlayers_AndHandleExternalServiceErrors() throws Exception {
        when(externalPlayerService.importAndSavePlayer(anyLong(), any(), any()))
            .thenReturn(createBasePlayer("ImportedPlayer"));
        String importJson = "{\"playerIds\": [1], \"latitude\": 0, \"longitude\": 0}";
        mockMvc.perform(post("/api/players/import")
                .contentType(MediaType.APPLICATION_JSON)
                .content(importJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$[0].name").value("ImportedPlayer"));
    }

    private Player createBasePlayer(String name) {
        Player p = new Player();
        p.setName(name);
        p.setLatitude(BigDecimal.ZERO);
        p.setLongitude(BigDecimal.ZERO);
        p.setCreatedAt(LocalDateTime.now());
        return p;
    }
}
