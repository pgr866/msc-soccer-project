package es.ual.player_service.repository;

import es.ual.player_service.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    @Query(value = "SELECT * FROM player WHERE " +
           "(?1 IS NULL OR name LIKE CONCAT('%', ?1, '%') OR team LIKE CONCAT('%', ?1, '%') OR league LIKE CONCAT('%', ?1, '%')) AND " +
           "(CAST(?2 AS TIMESTAMP) IS NULL OR created_at >= CAST(?2 AS TIMESTAMP)) AND " +
           "(CAST(?3 AS TIMESTAMP) IS NULL OR created_at <= CAST(?3 AS TIMESTAMP))", 
           nativeQuery = true)
    List<Player> findByFilters(String query, LocalDateTime dateStart, LocalDateTime dateEnd);
}
