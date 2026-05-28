package es.ual.gateway.config;

import es.ual.gateway.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import java.util.Arrays;

@Configuration
public class RouteConfig {

    private final Environment env;

    public RouteConfig(Environment env) {
        this.env = env;
    }

    @Value("${GCP_PROJECT_NUMBER:}")
    private String projectNumber;

    @Value("${REGION:}")
    private String region;

    private String getServiceUri(String serviceName) {
        boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod");
        if (isProd && !projectNumber.isEmpty() && !region.isEmpty()) {
            return "https://" + serviceName + "-" + projectNumber + "." + region + ".run.app";
        }
        return "lb://" + serviceName;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        String playerUri = getServiceUri("player-service");

        return builder.routes()

            // GET /api/players (Any)
            .route("get-players", r -> r.path("/player-service/api/players")
                .and().method("GET")
                .filters(f -> f.rewritePath("/player-service/(?<remaining>.*)", "/${remaining}"))
                .uri(playerUri))

            // GET /api/players/search (Authenticated/Admin)
            .route("search-external-players", r -> r.path("/player-service/api/players/search")
                .and().method("GET")
                .filters(f -> f.filter(new JwtAuthenticationFilter("USER,ADMIN"))
                            .rewritePath("/player-service/(?<remaining>.*)", "/${remaining}"))
                .uri(playerUri))

            // GET /api/players/:id (Any)
            .route("get-player", r -> r.path("/player-service/api/players/{id}")
                .and().method("GET")
                .filters(f -> f.rewritePath("/player-service/(?<remaining>.*)", "/${remaining}"))
                .uri(playerUri))

            // POST /api/players (Authenticated/Admin)
            .route("create-player", r -> r.path("/player-service/api/players")
                .and().method("POST")
                .filters(f -> f.filter(new JwtAuthenticationFilter("USER,ADMIN"))
                            .rewritePath("/player-service/(?<remaining>.*)", "/${remaining}"))
                .uri(playerUri))
            
            // PUT /api/players/:id (Admin)
            .route("update-player", r -> r.path("/player-service/api/players/{id}")
                .and().method("PUT")
                .filters(f -> f.filter(new JwtAuthenticationFilter("ADMIN"))
                            .rewritePath("/player-service/(?<remaining>.*)", "/${remaining}"))
                .uri(playerUri))

            // DELETE /api/players/:id (Admin)
            .route("delete-player", r -> r.path("/player-service/api/players/{id}")
                .and().method("DELETE")
                .filters(f -> f.filter(new JwtAuthenticationFilter("ADMIN"))
                            .rewritePath("/player-service/(?<remaining>.*)", "/${remaining}"))
                .uri(playerUri))

            .build();
    }
}
