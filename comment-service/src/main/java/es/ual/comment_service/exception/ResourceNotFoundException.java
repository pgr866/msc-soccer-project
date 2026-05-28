package es.ual.comment_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class ResourceNotFoundException extends ResponseStatusException {
	private static final long serialVersionUID = 1L;

	public ResourceNotFoundException(HttpStatus code, String message) {
		super(code, message);
	}
}
