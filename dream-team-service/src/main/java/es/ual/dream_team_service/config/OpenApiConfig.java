package es.ual.dream_team_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;

@Configuration
public class OpenApiConfig {
    @Value("${openapi.title:Default API Title}")
    private String title;

    @Value("${openapi.description:Default Description}")
    private String description;

    @Value("${openapi.version:1.0.0}")
    private String version;

    @Value("${openapi.contact.name:Default Contact}")
    private String contactName;

    @Value("${openapi.contact.email:default@example.com}")
    private String contactEmail;

    @Value("${openapi.contact.url:http://localhost:8080}")
    private String contactUrl;

    @Value("${openapi.server-url:http://localhost:8080}")
    private String serverUrl;

	@Bean
    @ConditionalOnProperty(name = "springdoc.api-docs.enabled", havingValue = "true", matchIfMissing = true)
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")))
            .info(new Info().title(title)
                .description(description).version(version)
                .contact(new Contact().name(contactName).email(contactEmail).url(contactUrl)))
            .servers(List.of(new Server().url(serverUrl).description("Gateway Server")));
    }
}
