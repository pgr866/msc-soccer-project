package es.ual.comment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "player-service") 
public interface PlayerClient {

    @GetMapping(value = "/api/players/{id}")
    void getPlayerById(@PathVariable("id") Long id);
}
