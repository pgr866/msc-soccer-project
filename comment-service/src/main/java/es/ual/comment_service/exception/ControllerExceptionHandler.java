package es.ual.comment_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<CustomResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        CustomResponse resp = new CustomResponse(ex.getReason());
        return new ResponseEntity<>(resp, ex.getStatusCode());
    }
}
