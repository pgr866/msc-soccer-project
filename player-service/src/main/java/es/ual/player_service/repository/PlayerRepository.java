package es.ual.player_service.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import es.ual.player_service.domain.Player;

@Repository
public interface PlayerRepository extends CrudRepository<Player, Long> {
    
}
