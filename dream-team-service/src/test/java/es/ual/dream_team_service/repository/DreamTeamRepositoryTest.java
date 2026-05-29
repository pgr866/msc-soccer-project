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
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, properties = {
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
})
@Testcontainers
class DreamTeamRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private DreamTeamRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void shouldFindByUserId() {
        DreamTeam dt = new DreamTeam();
        dt.setName("Champions");
        dt.setUserId("user_123");
        dt.setCreatedAt(LocalDateTime.now());
        dt.setPlayerIds(Set.of(1L, 2L));
        repository.save(dt);

        assertThat(repository.findByUserId("user_123")).hasSize(1);
        assertThat(repository.findByUserId("other_user")).isEmpty();
    }
}
