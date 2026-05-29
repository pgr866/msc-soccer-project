package es.ual.dream_team_service.repository;

import es.ual.dream_team_service.domain.DreamTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface DreamTeamRepository extends JpaRepository<DreamTeam, Long> {
    List<DreamTeam> findByUserId(String userId);
}

