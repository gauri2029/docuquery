package com.docuquery.docuquery.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class VectorStoreService {

    private final WebClient webClient;
    private static final String COLLECTION_NAME = "docuquery";
    private static final String BASE_PATH = "/api/v2/tenants/default_tenant/databases/default_database";
    private String collectionId;

    public VectorStoreService() {
        this.webClient = WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    @SuppressWarnings("unchecked")
    private String getOrCreateCollection() {
        if (collectionId != null) return collectionId;

        try {
            Map<String, Object> response = webClient.post()
                    .uri(BASE_PATH + "/collections")
                    .bodyValue(Map.of("name", COLLECTION_NAME, "get_or_create", true))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            collectionId = (String) response.get("id");
        } catch (Exception e) {
            throw new RuntimeException("Failed to connect to ChromaDB", e);
        }
        return collectionId;
    }

    @SuppressWarnings("unchecked")
    public void store(List<String> chunks, List<List<Double>> embeddings, Long documentId) {
        String colId = getOrCreateCollection();

        List<String> ids = new ArrayList<>();
        List<Map<String, String>> metadatas = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            ids.add(UUID.randomUUID().toString());
            metadatas.add(Map.of("documentId", String.valueOf(documentId), "chunkIndex", String.valueOf(i)));
        }

        List<List<Float>> floatEmbeddings = embeddings.stream()
                .map(emb -> emb.stream().map(Double::floatValue).toList())
                .toList();

        webClient.post()
                .uri(BASE_PATH + "/collections/" + colId + "/add")
                .bodyValue(Map.of(
                        "ids", ids,
                        "documents", chunks,
                        "embeddings", floatEmbeddings,
                        "metadatas", metadatas
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @SuppressWarnings("unchecked")
    public List<String> query(List<Double> queryEmbedding, int topK) {
        String colId = getOrCreateCollection();

        List<List<Float>> floatEmbedding = List.of(
                queryEmbedding.stream().map(Double::floatValue).toList()
        );

        Map<String, Object> response = webClient.post()
                .uri(BASE_PATH + "/collections/" + colId + "/query")
                .bodyValue(Map.of(
                        "query_embeddings", floatEmbedding,
                        "n_results", topK
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<List<String>> documents = (List<List<String>>) response.get("documents");
        return documents.get(0);
    }
}