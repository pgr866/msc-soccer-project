package es.ual.player_service.controller;

import es.ual.player_service.domain.Player;
import es.ual.player_service.repository.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    void shouldFilterPlayersByName() throws Exception {
        // Create a player in the Testcontainers real DB
        Player p = new Player();
        p.setName("Neymar");
        p.setLatitude(BigDecimal.ZERO);
        p.setLongitude(BigDecimal.ZERO);
        p.setCreatedAt(LocalDateTime.now());
        playerRepository.save(p);

        // Verify that the filtering endpoint finds it
        mockMvc.perform(get("/api/players").param("query", "Ney"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Neymar"));
    }

    @Test
    void shouldReturn400_WhenCreatingPlayerWithInvalidData() throws Exception {
        // Create invalid player data (name is required)
        String invalidPlayerJson = "{\"name\": \"\", \"latitude\": 0, \"longitude\": 0}";
        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPlayerJson))
            .andExpect(status().isBadRequest());
    }
}
