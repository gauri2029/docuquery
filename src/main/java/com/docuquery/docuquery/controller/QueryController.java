package com.docuquery.docuquery.controller;

import com.docuquery.docuquery.service.EmbeddingService;
import com.docuquery.docuquery.service.LLMService;
import com.docuquery.docuquery.service.VectorStoreService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class QueryController {

    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;
    private final LLMService llmService;

    private static final String SYSTEM_PROMPT = """
            You are a technical documentation assistant. Answer the user's question
            using ONLY the provided context. If the context doesn't contain enough
            information, say so clearly.
            
            Rules:
            - Cite your sources using [Source: section_name] format
            - Be concise and technical
            - If multiple sources conflict, note the discrepancy
            """;

    public QueryController(EmbeddingService embeddingService,
                           VectorStoreService vectorStoreService,
                           LLMService llmService) {
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
        this.llmService = llmService;
    }

    @PostMapping("/query")
    public Map<String, Object> query(@RequestBody Map<String, String> request) {
        String question = request.get("question");

        // 1. Embed the question
        List<List<Double>> embeddings = embeddingService.embed(List.of(question));
        List<Double> queryEmbedding = embeddings.get(0);

        // 2. Retrieve relevant chunks from ChromaDB
        List<String> relevantChunks = vectorStoreService.query(queryEmbedding, 5);

        // 3. Build the augmented prompt
        String context = String.join("\n\n---\n\n", relevantChunks);
        String userMessage = "Context:\n" + context + "\n\nQuestion: " + question;

        // 4. Generate answer via LLM
        String answer = llmService.ask(SYSTEM_PROMPT, userMessage);

        return Map.of(
                "answer", answer,
                "sourcesUsed", relevantChunks.size(),
                "question", question
        );
    }
}