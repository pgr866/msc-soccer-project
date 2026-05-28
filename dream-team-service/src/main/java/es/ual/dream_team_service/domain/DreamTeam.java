package es.ual.dream_team_service.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "dream-team")
public class DreamTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ElementCollection
    @CollectionTable(name = "dream_team_players", joinColumns = @JoinColumn(name = "dream_team_id"))
    @Column(name = "player_id")
    private Set<Long> playerIds = new HashSet<>();

    public DreamTeam() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Long> getPlayerIds() { return playerIds; }
    public void setPlayerIds(Set<Long> playerIds) { this.playerIds = playerIds; }
}
