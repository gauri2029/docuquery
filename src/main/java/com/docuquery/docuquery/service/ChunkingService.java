package com.docuquery.docuquery.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChunkingService {

    private static final int CHUNK_SIZE = 1000;  // characters (~250 tokens)
    private static final int OVERLAP = 200;

    public List<String> chunk(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + CHUNK_SIZE, text.length());

            // Try to break at a paragraph or sentence boundary
            if (end < text.length()) {
                int paraBreak = text.lastIndexOf("\n\n", end);
                if (paraBreak > start) {
                    end = paraBreak;
                } else {
                    int sentenceBreak = text.lastIndexOf(". ", end);
                    if (sentenceBreak > start) {
                        end = sentenceBreak + 1;
                    }
                }
            }

            String chunk = text.substring(start, end).trim();
            if (!chunk.isEmpty()) chunks.add(chunk);  // skip blank chunks (rejected by the vector store)

            if (end == text.length()) break;

            // Advance with overlap, but never regress or stall: when a paragraph/
            // sentence boundary lands within OVERLAP of start, end - OVERLAP would be
            // <= start, causing an infinite loop. Fall back to end to guarantee progress.
            int nextStart = end - OVERLAP;
            if (nextStart <= start) nextStart = end;
            start = nextStart;
        }
        return chunks;
    }
}