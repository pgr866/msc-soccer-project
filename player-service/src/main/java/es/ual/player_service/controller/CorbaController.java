package es.ual.player_service.controller;

import es.ual.player_service.client.CorbaClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/corba")
@Tag(name = "corba", description = "Corba bridge API")
public class CorbaController {

    @Autowired
    private CorbaClient corbaClient;

    @Operation(summary = "Send news item", description = "Sends a new news item to the buffer")
    @PostMapping(value = "/send", produces = MediaType.APPLICATION_JSON_VALUE)
    public String sendNews(@RequestParam String title, @RequestParam String player, 
                           @RequestParam String description, @RequestParam String labels) {
        return corbaClient.executeAction(Map.of(
            "title", title, "player", player, "description", description, 
            "labels", labels, "action", "Enviar", "format", "json"
        ));
    }

    @Operation(summary = "Read news item", description = "Reads the current news item from the buffer")
    @PostMapping(value = "/read", produces = MediaType.APPLICATION_JSON_VALUE)
    public String readNews() {
        return corbaClient.executeAction(Map.of("action", "Leer", "format", "json"));
    }

    @Operation(summary = "Receive news item", description = "Receives and removes the news item from the buffer")
    @PostMapping(value = "/receive", produces = MediaType.APPLICATION_JSON_VALUE)
    public String receiveNews() {
        return corbaClient.executeAction(Map.of("action", "Recibir", "format", "json"));
    }

    @Operation(summary = "Set buffer limit", description = "Updates the news buffer limit")
    @PostMapping(value = "/limit", produces = MediaType.APPLICATION_JSON_VALUE)
    public String setLimit(@RequestParam int limit) {
        return corbaClient.executeAction(Map.of("limit", String.valueOf(limit), "action", "Limitar", "format", "json"));
    }
}
