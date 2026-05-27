package es.ual.gateway.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import java.util.concurrent.TimeUnit;

public class JwtAuthenticationFilter implements GatewayFilter {

    private final String requiredRole;

    private static final Cache<String, String> roleCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(1000)
            .build();

    public JwtAuthenticationFilter(String requiredRole) {
        this.requiredRole = requiredRole;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }
        return Mono.fromCallable(() -> FirebaseAuth.getInstance().verifyIdToken(auth.substring(7)))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(decodedToken -> {
                String uid = decodedToken.getUid();
                String cachedRole = roleCache.getIfPresent(uid);
                if (cachedRole != null) {
                    return checkRoleAndProceed(exchange, chain, decodedToken, cachedRole);
                }
                return Mono.fromCallable(() -> FirestoreClient.getFirestore().collection("users").document(uid).get().get())
                    .subscribeOn(Schedulers.boundedElastic())
                    .flatMap(userDoc -> {
                        String role = (userDoc.exists() && userDoc.contains("role")) ? userDoc.getString("role") : "USER";
                        roleCache.put(uid, role);
                        return checkRoleAndProceed(exchange, chain, decodedToken, role);
                    });
            })
            .onErrorResume(e -> unauthorized(exchange));
    }

    private Mono<Void> checkRoleAndProceed(ServerWebExchange exchange, GatewayFilterChain chain, FirebaseToken token, String role) {
        if (requiredRole != null && !requiredRole.equals(role)) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange.mutate().request(r -> r.header("X-User-ID", token.getUid()).header("X-User-Email", token.getEmail()).header("X-User-Role", role)).build());
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
