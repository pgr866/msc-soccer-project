package es.ual.player_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler(PlayerNotFoundException.class)
    public ResponseEntity<CustomResponse> handlePlayerNotFound(PlayerNotFoundException ex) {
        CustomResponse resp = new CustomResponse(ex.getReason());
        return new ResponseEntity<>(resp, ex.getStatusCode());
    }
}
