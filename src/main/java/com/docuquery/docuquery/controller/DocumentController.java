package com.docuquery.docuquery.controller;

import com.docuquery.docuquery.model.Document;
import com.docuquery.docuquery.repository.DocumentRepository;
import com.docuquery.docuquery.service.ChunkingService;
import com.docuquery.docuquery.service.EmbeddingService;
import com.docuquery.docuquery.service.VectorStoreService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final ChunkingService chunkingService;
    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;

    public DocumentController(DocumentRepository documentRepository,
                              ChunkingService chunkingService,
                              EmbeddingService embeddingService,
                              VectorStoreService vectorStoreService) {
        this.documentRepository = documentRepository;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
    }

    @PostMapping("/ingest")
    public Map<String, Object> ingest(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String content = request.get("content");

        List<String> chunks = chunkingService.chunk(content);

        // Embed chunks via OpenAI
        List<List<Double>> embeddings = embeddingService.embed(chunks);

        // Save metadata to PostgreSQL
        Document doc = new Document();
        doc.setTitle(title);
        doc.setFilename(title + ".md");
        doc.setChunkCount(chunks.size());
        documentRepository.save(doc);

        // Store vectors in ChromaDB
        vectorStoreService.store(chunks, embeddings, doc.getId());

        return Map.of(
            "documentId", doc.getId(),
            "title", title,
            "chunksCreated", chunks.size()
        );
    }

    @GetMapping
    public List<Document> listDocuments() {
        return documentRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteDocument(@PathVariable Long id) {
        documentRepository.deleteById(id);
        return Map.of("status", "deleted", "documentId", String.valueOf(id));
    }
}