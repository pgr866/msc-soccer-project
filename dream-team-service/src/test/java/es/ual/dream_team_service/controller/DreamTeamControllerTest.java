package es.ual.dream_team_service.controller;

import es.ual.dream_team_service.domain.DreamTeam;
import es.ual.dream_team_service.repository.DreamTeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.Set;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
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
    private DreamTeamRepository repository;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
        repository.deleteAll();
    }

    @Test
    void shouldReturnUserDreamTeams() throws Exception {
        // GIVEN
        DreamTeam dt = new DreamTeam();
        dt.setName("My Team");
        dt.setUserId("user_123");
        dt.setCreatedAt(LocalDateTime.now());
        dt.setPlayerIds(Set.of(1L));
        repository.save(dt);

        // WHEN & THEN
        mockMvc.perform(get("/api/dream-teams")
                .header("X-User-ID", "user_123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("My Team"));
    }

    @Test
    void shouldReturnEmptyList_WhenNoTeamsForUser() throws Exception {
        mockMvc.perform(get("/api/dream-teams")
                .header("X-User-ID", "unknown_user"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }
}
