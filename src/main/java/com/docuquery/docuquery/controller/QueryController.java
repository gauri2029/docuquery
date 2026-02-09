package com.docuquery.docuquery.controller;

import com.docuquery.docuquery.service.EmbeddingService;
import com.docuquery.docuquery.service.LLMService;
import com.docuquery.docuquery.service.VectorStoreService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class QueryController {

    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;
    private final LLMService llmService;
    private final Timer queryLatencyTimer;
    private final Counter queryCounter;
    private final Counter errorCounter;

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
                           LLMService llmService,
                           MeterRegistry registry) {
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
        this.llmService = llmService;
        this.queryLatencyTimer = Timer.builder("docuquery.query.latency")
                .description("Query end-to-end latency")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(registry);
        this.queryCounter = Counter.builder("docuquery.query.total")
                .description("Total queries processed")
                .register(registry);
        this.errorCounter = Counter.builder("docuquery.query.errors")
                .description("Total query errors")
                .register(registry);
    }

    @PostMapping("/query")
    public Map<String, Object> query(@RequestBody Map<String, String> request) {
        return queryLatencyTimer.record(() -> {
            try {
                String question = request.get("question");

                List<List<Double>> embeddings = embeddingService.embed(List.of(question));
                List<Double> queryEmbedding = embeddings.get(0);

                List<String> relevantChunks = vectorStoreService.query(queryEmbedding, 5);

                String context = String.join("\n\n---\n\n", relevantChunks);
                String userMessage = "Context:\n" + context + "\n\nQuestion: " + question;

                String answer = llmService.ask(SYSTEM_PROMPT, userMessage);
                queryCounter.increment();

                return Map.of(
                        "answer", answer,
                        "sourcesUsed", relevantChunks.size(),
                        "question", question
                );
            } catch (Exception e) {
                errorCounter.increment();
                throw e;
            }
        });
    }
}