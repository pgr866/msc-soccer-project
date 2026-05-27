package es.ual.player_service.repository;

import es.ual.player_service.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    @Query(value = "SELECT * FROM player WHERE " +
           "(?1 IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(team) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(league) LIKE LOWER(CONCAT('%', ?1, '%'))) AND " +
           "(CAST(?2 AS DATE) IS NULL OR CAST(created_at AS DATE) >= CAST(?2 AS DATE)) AND " +
           "(CAST(?3 AS DATE) IS NULL OR CAST(created_at AS DATE) <= CAST(?3 AS DATE))", 
           nativeQuery = true)
    List<Player> findByFilters(String query, LocalDate dateStart, LocalDate dateEnd);
}
