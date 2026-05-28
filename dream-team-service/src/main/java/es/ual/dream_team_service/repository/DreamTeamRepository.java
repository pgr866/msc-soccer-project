package es.ual.dream_team_service.repository;

import es.ual.dream_team_service.domain.DreamTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DreamTeamRepository extends JpaRepository<DreamTeam, Long> {
}
