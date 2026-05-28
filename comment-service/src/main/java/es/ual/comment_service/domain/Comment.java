package es.ual.comment_service.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "comment")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String author;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String text;

    @Min(0) @Max(5)
    @Column(nullable = false)
    private Byte rating;

    @DecimalMin("-90.0") @DecimalMax("90.0")
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @DecimalMin("-180.0") @DecimalMax("180.0")
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Comment() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Byte getRating() { return rating; }
    public void setRating(Byte rating) { this.rating = rating; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
