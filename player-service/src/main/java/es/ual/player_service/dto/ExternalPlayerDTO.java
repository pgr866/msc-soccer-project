package es.ual.player_service.dto;

import java.time.LocalDate;

public record ExternalPlayerDTO(
    Long id,
    String name,
    String first_name,
    String last_name,
    Integer age,
    LocalDate birthdate,
    String nationality,
    Double height,
    Double weight,
    Integer number,
    String position,
    String photo_url
) {}
