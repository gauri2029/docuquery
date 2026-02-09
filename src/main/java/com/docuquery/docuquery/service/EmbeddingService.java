package com.docuquery.docuquery.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private final WebClient webClient;
    private final String model;

    public EmbeddingService(@Value("${openai.api-key}") String apiKey,
                            @Value("${openai.embedding-model}") String model) {
        this.model = model;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @SuppressWarnings("unchecked")
    public List<List<Double>> embed(List<String> texts) {
        Map<String, Object> body = Map.of("input", texts, "model", model);

        Map<String, Object> response = webClient.post()
                .uri("/embeddings")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        return data.stream()
                .map(d -> (List<Double>) d.get("embedding"))
                .toList();
    }
}