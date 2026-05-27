package es.ual.player_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class PlayerNotFoundException extends ResponseStatusException {
	private static final long serialVersionUID = 1L;

	public PlayerNotFoundException(HttpStatus code, String message) {
		super(code, message);
	}
}
