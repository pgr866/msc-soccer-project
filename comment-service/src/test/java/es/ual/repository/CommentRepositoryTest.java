package es.ual.comment_service.repository;

import es.ual.comment_service.domain.Comment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
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
class CommentRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private CommentRepository commentRepository;

    @BeforeEach
    void setup() {
        commentRepository.deleteAll();
    }

    @Test
    void shouldFindByPlayerId() {
        // GIVEN
        commentRepository.save(createComment(1L, "Great player"));
        commentRepository.save(createComment(1L, "Second comment"));
        commentRepository.save(createComment(2L, "Different player"));

        // WHEN
        List<Comment> player1Comments = commentRepository.findByPlayerId(1L);

        // THEN
        assertThat(player1Comments).hasSize(2);
        assertThat(player1Comments).allMatch(c -> c.getPlayerId().equals(1L));
    }

    @Test
    void shouldReturnEmptyList_WhenPlayerHasNoComments() {
        // WHEN
        List<Comment> comments = commentRepository.findByPlayerId(999L);

        // THEN
        assertThat(comments).isEmpty();
    }

    @Test
    void shouldSaveAndRetrieveComment() {
        // GIVEN
        Comment comment = createComment(1L, "Persistence test");
        
        // WHEN
        Comment saved = commentRepository.save(comment);
        
        // THEN
        Comment retrieved = commentRepository.findById(saved.getId()).orElse(null);
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getText()).isEqualTo("Persistence test");
    }

    private Comment createComment(Long playerId, String text) {
        Comment c = new Comment();
        c.setPlayerId(playerId);
        c.setAuthor("user@test.com");
        c.setText(text);
        c.setRating((byte) 5);
        c.setLatitude(BigDecimal.ZERO);
        c.setLongitude(BigDecimal.ZERO);
        c.setCreatedAt(LocalDateTime.now());
        return c;
    }
}
