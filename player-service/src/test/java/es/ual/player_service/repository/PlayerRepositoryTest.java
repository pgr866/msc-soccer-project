package es.ual.player_service.repository;

import es.ual.player_service.domain.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
})
@Testcontainers
class PlayerRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private PlayerRepository playerRepository;

    @BeforeEach
    void setup() {
        playerRepository.deleteAll();
    }

    @Test
    void shouldFindPlayersByQuery_NameOrTeamOrLeague() {
        // GIVEN
        playerRepository.save(createPlayer("Neymar", "PSG", "Ligue 1", LocalDateTime.now()));
        playerRepository.save(createPlayer("Cristiano", "Al-Nassr", "Pro League", LocalDateTime.now()));

        // WHEN & THEN: Search by Name
        assertThat(playerRepository.findByFilters("Ney", null, null)).hasSize(1);
        // Search by Team
        assertThat(playerRepository.findByFilters("PSG", null, null)).hasSize(1);
        // Search by League
        assertThat(playerRepository.findByFilters("Pro", null, null)).hasSize(1);
    }

    @Test
    void shouldFilterPlayersByDateRange() {
        // GIVEN
        LocalDateTime today = LocalDateTime.now();
        playerRepository.save(createPlayer("Old", "Team", "League", today.minusDays(10)));
        playerRepository.save(createPlayer("New", "Team", "League", today));

        // WHEN: Search for players created in the last 5 days
        List<Player> found = playerRepository.findByFilters(null, LocalDate.now().minusDays(5), LocalDate.now());

        // THEN
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getName()).isEqualTo("New");
    }

    @Test
    void shouldReturnAll_WhenFiltersAreNull() {
        // GIVEN
        playerRepository.save(createPlayer("P1", "T1", "L1", LocalDateTime.now()));
        playerRepository.save(createPlayer("P2", "T2", "L2", LocalDateTime.now()));

        // WHEN
        List<Player> found = playerRepository.findByFilters(null, null, null);

        // THEN
        assertThat(found).hasSize(2);
    }

    @Test
    void shouldReturnEmpty_WhenNoMatchFound() {
        // GIVEN
        playerRepository.save(createPlayer("Neymar", "PSG", "Ligue 1", LocalDateTime.now()));

        // WHEN
        List<Player> found = playerRepository.findByFilters("NonExistent", null, null);

        // THEN
        assertThat(found).isEmpty();
    }

    private Player createPlayer(String name, String team, String league, LocalDateTime createdAt) {
        Player p = new Player();
        p.setName(name);
        p.setTeam(team);
        p.setLeague(league);
        p.setLatitude(BigDecimal.ZERO);
        p.setLongitude(BigDecimal.ZERO);
        p.setCreatedAt(createdAt);
        return p;
    }
}
