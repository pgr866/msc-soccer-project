package es.ual.dream_team_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.Map;

@FeignClient(name = "groq-client", url = "https://api.groq.com/openai/v1")
public interface GroqClient {

    @PostMapping("/chat/completions")
    Map<String, Object> getCompletion(
        @RequestHeader("Authorization") String apiKey,
        @RequestBody Map<String, Object> requestBody
    );
}
