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

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
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
    void shouldFindPlayersByQuery() {
        Player p1 = createPlayer("Neymar", "Santos", "Serie A", LocalDateTime.now());
        Player p2 = createPlayer("Messi", "Inter Miami", "MLS", LocalDateTime.now());
        playerRepository.saveAll(List.of(p1, p2));
        List<Player> found = playerRepository.findByFilters("Neymar", null, null);
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getName()).isEqualTo("Neymar");
    }

    @Test
    void shouldFindPlayersByDateRange() {
        LocalDate today = LocalDate.now();
        Player p1 = createPlayer("Old Player", "Team", "League", today.minusDays(10).atStartOfDay());
        Player p2 = createPlayer("New Player", "Team", "League", today.atStartOfDay());
        playerRepository.saveAll(List.of(p1, p2));
        List<Player> found = playerRepository.findByFilters(null, today, null);
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getName()).isEqualTo("New Player");
    }

    @Test
    void shouldReturnAllWhenFiltersAreNull() {
        playerRepository.save(createPlayer("P1", "T1", "L1", LocalDateTime.now()));
        playerRepository.save(createPlayer("P2", "T2", "L2", LocalDateTime.now()));
        List<Player> found = playerRepository.findByFilters(null, null, null);
        assertThat(found).hasSize(2);
    }

    private Player createPlayer(String name, String team, String league, LocalDateTime createdAt) {
        Player p = new Player();
        p.setName(name);
        p.setTeam(team);
        p.setLeague(league);
        p.setCreatedAt(createdAt);
        p.setLatitude(BigDecimal.ZERO);
        p.setLongitude(BigDecimal.ZERO);
        return p;
    }
}
