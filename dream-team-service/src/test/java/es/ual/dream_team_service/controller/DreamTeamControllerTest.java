package es.ual.dream_team_service.controller;

import es.ual.dream_team_service.client.GroqClient;
import es.ual.dream_team_service.client.PlayerClient;
import es.ual.dream_team_service.domain.DreamTeam;
import es.ual.dream_team_service.dto.PlayerNameDTO;
import es.ual.dream_team_service.repository.DreamTeamRepository;
import es.ual.dream_team_service.service.DreamTeamService;
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

import java.time.LocalDateTime;
import java.util.Set;

import static org.mockito.Mockito.*;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "eureka.client.enabled=false",
    "spring.cloud.config.enabled=false"
})
@Testcontainers
class DreamTeamControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @Autowired
    private DreamTeamRepository dreamTeamRepository;

    @MockitoBean
    private PlayerClient playerClient;

    @MockitoBean
    private GroqClient groqClient;

    @MockitoBean
    private DreamTeamService dreamTeamService;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
        dreamTeamRepository.deleteAll();
    }

    @Test
    void shouldGetAllDreamTeamsForUser() throws Exception {
        DreamTeam dt = new DreamTeam();
        dt.setName("My All Stars");
        dt.setUserId("user_123");
        dt.setPlayerIds(Set.of(1L));
        dt.setCreatedAt(LocalDateTime.now());
        dreamTeamRepository.save(dt);
        when(playerClient.getPlayerName(1L)).thenReturn(new PlayerNameDTO(1L, "Neymar"));
        mockMvc.perform(get("/api/dream-teams")
                .header("X-User-ID", "user_123")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("My All Stars"))
            .andExpect(jsonPath("$[0].players[0].name").value("Neymar"));
    }

    @Test
    void shouldGenerateAndSaveDreamTeamWithAI() throws Exception {
        DreamTeam generatedTeam = new DreamTeam();
        generatedTeam.setId(1L);
        generatedTeam.setName("Champions XI");
        generatedTeam.setUserId("user_123");
        generatedTeam.setPlayerIds(Set.of(1L));
        generatedTeam.setCreatedAt(LocalDateTime.now());
        when(dreamTeamService.generateAndSaveDreamTeam("user_123")).thenReturn(generatedTeam);
        when(playerClient.getPlayerName(1L)).thenReturn(new PlayerNameDTO(1L, "Neymar"));
        mockMvc.perform(post("/api/dream-teams")
                .header("X-User-ID", "user_123")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Champions XI"))
            .andExpect(jsonPath("$.players[0].name").value("Neymar"));
    }

    @Test
    void shouldReturn422_WhenAICollaborationFails() throws Exception {
        DreamTeam emptyTeam = new DreamTeam();
        emptyTeam.setPlayerIds(Set.of()); 
        emptyTeam.setCreatedAt(LocalDateTime.now());
        when(dreamTeamService.generateAndSaveDreamTeam("user_123")).thenReturn(emptyTeam);
        mockMvc.perform(post("/api/dream-teams")
                .header("X-User-ID", "user_123"))
            .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void shouldReturn401_WhenUserIdIsMissing() throws Exception {
        mockMvc.perform(get("/api/dream-teams"))
            .andExpect(status().isBadRequest());
    }
}
