package es.ual.player_service.dto;

import java.time.LocalDate;

public record ExternalPlayerDTO(
    Long id,
    String name,
    String firstName,
    String lastName,
    Integer age,
    LocalDate birthdate,
    String nationality,
    Double height,
    Double weight,
    Integer number,
    String position,
    String photoUrl
) {}
