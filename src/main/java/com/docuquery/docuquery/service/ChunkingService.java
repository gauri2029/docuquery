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

            chunks.add(text.substring(start, end).trim());
            start = end - OVERLAP;
            if (start < 0) start = 0;
            if (end == text.length()) break;
        }
        return chunks;
    }
}