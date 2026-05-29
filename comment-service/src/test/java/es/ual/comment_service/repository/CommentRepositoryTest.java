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

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
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
    void shouldSaveAndFindComment() {
        Comment comment = createComment(1L, "Great performance!", 5);
        commentRepository.save(comment);
        List<Comment> found = commentRepository.findAll();
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getText()).isEqualTo("Great performance!");
    }

    @Test
    void shouldFindByPlayerId() {
        commentRepository.save(createComment(1L, "Comment 1 for player 1", 5));
        commentRepository.save(createComment(1L, "Comment 2 for player 1", 4));
        commentRepository.save(createComment(2L, "Comment for player 2", 3));
        List<Comment> player1Comments = commentRepository.findByPlayerId(1L);
        List<Comment> player2Comments = commentRepository.findByPlayerId(2L);
        assertThat(player1Comments).hasSize(2);
        assertThat(player2Comments).hasSize(1);
        assertThat(player1Comments.get(0).getPlayerId()).isEqualTo(1L);
    }

    @Test
    void shouldReturnEmptyListWhenNoCommentsFoundForPlayer() {
        List<Comment> found = commentRepository.findByPlayerId(999L);
        assertThat(found).isEmpty();
    }

    @Test
    void shouldDeleteComment() {
        Comment comment = commentRepository.save(createComment(1L, "To be deleted", 1));
        commentRepository.deleteById(comment.getId());
        List<Comment> found = commentRepository.findByPlayerId(1L);
        assertThat(found).isEmpty();
    }

    private Comment createComment(Long playerId, String text, int rating) {
        Comment c = new Comment();
        c.setPlayerId(playerId);
        c.setText(text);
        c.setRating((byte) rating);
        c.setAuthor("user@test.com");
        c.setCreatedAt(LocalDateTime.now());
        c.setLatitude(BigDecimal.ZERO);
        c.setLongitude(BigDecimal.ZERO);
        return c;
    }
}
