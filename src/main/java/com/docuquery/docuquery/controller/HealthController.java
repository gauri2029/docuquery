package com.docuquery.docuquery.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final DataSource dataSource;
    private final WebClient chromaClient;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
        this.chromaClient = WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    @GetMapping("/api/v1/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "UP");

        try (Connection conn = dataSource.getConnection()) {
            result.put("postgres", conn.isValid(2) ? "UP" : "DOWN");
        } catch (Exception e) {
            result.put("postgres", "DOWN");
            result.put("status", "DEGRADED");
        }

        try {
            chromaClient.get()
                    .uri("/api/v2/heartbeat")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            result.put("chromadb", "UP");
        } catch (Exception e) {
            result.put("chromadb", "DOWN");
            result.put("status", "DEGRADED");
        }

        return result;
    }
}