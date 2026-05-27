package es.ual.gateway.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Collections;

@Configuration
public class FirebaseConfig {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @PostConstruct
    public void init() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) return;
        boolean isProd = "prod".equals(activeProfile);
        FirebaseOptions options;
        if (isProd) {
            String b64Credentials = System.getenv("FIREBASE_SERVICE_ACCOUNT_B64");
            if (b64Credentials == null) throw new IllegalStateException("FIREBASE_SERVICE_ACCOUNT_B64 environment variable not set");
            byte[] decodedBytes = Base64.getDecoder().decode(b64Credentials);
            options = FirebaseOptions.builder().setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(decodedBytes))).build();
        } else {
            String authHost = System.getenv().getOrDefault("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099");
            String firestoreHost = System.getenv().getOrDefault("FIRESTORE_EMULATOR_HOST", "localhost:8088");
            System.setProperty("FIREBASE_AUTH_EMULATOR_HOST", authHost);
            System.setProperty("FIRESTORE_EMULATOR_HOST", firestoreHost);
            options = FirebaseOptions.builder().setCredentials(GoogleCredentials.create(null)).setProjectId("msc-soccer-project").build();
        }
        FirebaseApp.initializeApp(options);
    }
}
