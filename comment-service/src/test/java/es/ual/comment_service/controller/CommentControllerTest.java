package es.ual.comment_service.controller;

import es.ual.comment_service.client.PlayerClient;
import es.ual.comment_service.domain.Comment;
import es.ual.comment_service.repository.CommentRepository;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
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
class CommentControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @Autowired
    private CommentRepository commentRepository;

    @MockitoBean
    private PlayerClient playerClient;

    private Comment createValidComment(Long playerId, String text) {
        Comment c = new Comment();
        c.setPlayerId(playerId);
        c.setText(text);
        c.setAuthor("test-user");
        c.setRating((byte) 5);
        c.setLatitude(java.math.BigDecimal.ZERO);
        c.setLongitude(java.math.BigDecimal.ZERO);
        c.setCreatedAt(java.time.LocalDateTime.now());
        return c;
    }

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
        commentRepository.deleteAll();
    }

    @Test
    void shouldGetCommentsByPlayerId() throws Exception {
        Comment c = createValidComment(1L, "Great player!");
        commentRepository.save(c);
        mockMvc.perform(get("/api/comments/player/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].text").value("Great player!"));
    }

    @Test
    void shouldCreateCommentSuccessfully() throws Exception {
        doNothing().when(playerClient).getPlayerById(1L);
        String commentJson = "{\"text\": \"Amazing!\", \"rating\": 5, \"latitude\": 0, \"longitude\": 0}";
        mockMvc.perform(post("/api/comments/player/1")
                .header("X-User-ID", "user123")
                .header("X-User-Email", "test@test.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(commentJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.text").value("Amazing!"));
    }

    @Test
    void shouldReturn404_WhenPlayerDoesNotExistForComment() throws Exception {
        doThrow(FeignException.NotFound.class).when(playerClient).getPlayerById(999L);
        String commentJson = "{\"text\": \"Fake player\", \"rating\": 1}";
        mockMvc.perform(post("/api/comments/player/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(commentJson))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldDeleteCommentSuccessfully() throws Exception {
        Comment c = createValidComment(1L, "To be deleted");
        c = commentRepository.save(c);
        mockMvc.perform(delete("/api/comments/" + c.getId()))
            .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturn404_WhenDeletingNonExistentComment() throws Exception {
        mockMvc.perform(delete("/api/comments/999"))
            .andExpect(status().isNotFound());
    }
}
