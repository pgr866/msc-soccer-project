package es.ual.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import java.util.Arrays;

@EnableDiscoveryClient
@SpringBootApplication
public class GatewayApplication {

    private final Environment env;

    @Value("${app.cors.allowed-origin:}")
    private String allowedOrigin;

    public GatewayApplication(Environment env) {
        this.env = env;
    }

    @Bean
    public WebFilter corsFilter() {
        return (ServerWebExchange exchange, WebFilterChain chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();
            String origin = request.getHeaders().getOrigin();

            boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod");
            if (isProd) {
                if (origin != null && origin.equals(allowedOrigin)) {
                    response.getHeaders().add("Access-Control-Allow-Origin", allowedOrigin);
                    response.getHeaders().add("Access-Control-Allow-Credentials", "true");
                }
            } else {
                if (origin != null) {
                    response.getHeaders().add("Access-Control-Allow-Origin", origin);
                    response.getHeaders().add("Access-Control-Allow-Credentials", "true");
                }
            }

            if (request.getMethod() == HttpMethod.OPTIONS) {
                response.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.getHeaders().add("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
                response.getHeaders().add("Access-Control-Max-Age", "3600");
                response.setStatusCode(HttpStatus.NO_CONTENT);
                return Mono.empty();
            }
            return chain.filter(exchange);
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}