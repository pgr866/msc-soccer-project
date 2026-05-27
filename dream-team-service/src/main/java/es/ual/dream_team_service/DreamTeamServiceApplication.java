package es.ual.dream_team_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication
public class DreamTeamServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DreamTeamServiceApplication.class, args);
	}

}
