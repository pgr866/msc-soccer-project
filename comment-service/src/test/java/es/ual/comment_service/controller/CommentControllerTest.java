package es.ual.comment_service.controller;

import es.ual.comment_service.domain.Comment;
import es.ual.comment_service.repository.CommentRepository;
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
class CommentControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private WebApplicationContext wac;

    private MockMvc mockMvc;

    @Autowired
    private CommentRepository commentRepository;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
        commentRepository.deleteAll();
    }

    @Test
    void shouldGetCommentsByPlayer() throws Exception {
        // GIVEN
        Comment c = new Comment();
        c.setPlayerId(1L);
        c.setAuthor("user");
        c.setText("Great!");
        c.setRating((byte) 5);
        c.setLatitude(BigDecimal.ZERO);
        c.setLongitude(BigDecimal.ZERO);
        c.setCreatedAt(LocalDateTime.now());
        commentRepository.save(c);

        // WHEN & THEN
        mockMvc.perform(get("/api/comments/player/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].text").value("Great!"));
    }

    @Test
    void shouldDeleteComment() throws Exception {
        // GIVEN
        Comment c = new Comment();
        c.setPlayerId(1L);
        c.setAuthor("user");
        c.setText("To delete");
        c.setRating((byte) 3);
        c.setLatitude(BigDecimal.ZERO);
        c.setLongitude(BigDecimal.ZERO);
        c.setCreatedAt(LocalDateTime.now());
        Comment saved = commentRepository.save(c);

        // WHEN
        mockMvc.perform(delete("/api/comments/" + saved.getId()))
            .andExpect(status().isNoContent());

        // THEN
        mockMvc.perform(get("/api/comments/player/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void shouldReturn404_WhenDeletingNonExistentComment() throws Exception {
        mockMvc.perform(delete("/api/comments/999"))
            .andExpect(status().isNotFound());
    }
}
