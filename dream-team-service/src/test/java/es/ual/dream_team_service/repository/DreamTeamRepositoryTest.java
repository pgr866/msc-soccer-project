package es.ual.dream_team_service.repository;

import es.ual.dream_team_service.domain.DreamTeam;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "eureka.client.enabled=false",
    "spring.cloud.config.enabled=false",
    "groq.api.key=test-key"
})
@Testcontainers
class DreamTeamRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private DreamTeamRepository dreamTeamRepository;

    @BeforeEach
    void setup() {
        dreamTeamRepository.deleteAll();
    }

    @Test
    void shouldSaveAndFindDreamTeam() {
        DreamTeam dt = createDreamTeam("Team 1", "user1", Set.of(1L, 2L));
        dreamTeamRepository.save(dt);
        List<DreamTeam> all = dreamTeamRepository.findAll();
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getName()).isEqualTo("Team 1");
    }

    @Test
    void shouldFindByUserId() {
        dreamTeamRepository.save(createDreamTeam("Team 1", "user1", Set.of(1L)));
        dreamTeamRepository.save(createDreamTeam("Team 2", "user1", Set.of(2L)));
        dreamTeamRepository.save(createDreamTeam("Team 3", "user2", Set.of(3L)));
        List<DreamTeam> user1Teams = dreamTeamRepository.findByUserId("user1");
        List<DreamTeam> user2Teams = dreamTeamRepository.findByUserId("user2");
        assertThat(user1Teams).hasSize(2);
        assertThat(user2Teams).hasSize(1);
        assertThat(user2Teams.get(0).getName()).isEqualTo("Team 3");
    }

    @Test
    void shouldReturnEmptyListWhenUserHasNoTeams() {
        List<DreamTeam> found = dreamTeamRepository.findByUserId("non_existent_user");
        assertThat(found).isEmpty();
    }

    @Test
    void shouldDeleteDreamTeam() {
        DreamTeam dt = dreamTeamRepository.save(createDreamTeam("To Delete", "user1", Set.of(1L)));
        dreamTeamRepository.deleteById(dt.getId());
        assertThat(dreamTeamRepository.findById(dt.getId())).isEmpty();
    }

    private DreamTeam createDreamTeam(String name, String userId, Set<Long> playerIds) {
        DreamTeam dt = new DreamTeam();
        dt.setName(name);
        dt.setUserId(userId);
        dt.setPlayerIds(playerIds);
        dt.setCreatedAt(LocalDateTime.now());
        return dt;
    }
}
