package es.ual.comment_service.dto;

public record CommentRequestDTO(
    String text,
    Integer rating,
    Double latitude,
    Double longitude
) {}
