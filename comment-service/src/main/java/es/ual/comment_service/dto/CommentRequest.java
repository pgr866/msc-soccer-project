package es.ual.comment_service.dto;

public record CommentRequest(
    String text,
    Integer rating,
    Double latitude,
    Double longitude
) {}
