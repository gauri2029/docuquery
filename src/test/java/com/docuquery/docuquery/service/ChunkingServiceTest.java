package com.docuquery.docuquery.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChunkingServiceTest {

    private final ChunkingService service = new ChunkingService();

    @Test
    void normalShortDocumentProducesSingleChunkUnchanged() {
        String text = "This is a short document. It easily fits within one chunk.";
        List<String> chunks = service.chunk(text);

        assertEquals(1, chunks.size());
        assertEquals(text, chunks.get(0));
    }

    @Test
    void blankAndNullInputProduceNoChunks() {
        assertTrue(service.chunk(null).isEmpty());
        assertTrue(service.chunk("").isEmpty());
        assertTrue(service.chunk("   \n\n  \t ").isEmpty());
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void longMarkdownWithManyParagraphBreaksTerminatesWithoutBlankChunks() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 400; i++) {
            sb.append("## Section ").append(i).append("\n\n")
              .append("This is paragraph ").append(i)
              .append(" with some descriptive content for testing. ")
              .append("It contains a couple of sentences. \n\n");
        }
        String markdown = sb.toString();

        List<String> chunks = service.chunk(markdown);

        assertFalse(chunks.isEmpty(), "should produce chunks");
        assertAll(
            () -> chunks.forEach(c -> assertFalse(c.isBlank(), "no chunk should be blank")),
            // Sanity bound: chunking must not explode into a runaway number of chunks.
            () -> assertTrue(chunks.size() < markdown.length(), "chunk count must stay bounded")
        );
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void boundaryWithinOverlapDoesNotStall() {
        // A paragraph break near the very start forces end - OVERLAP <= start.
        // Without the forward-progress guard this loops forever / OOMs.
        String text = "Intro.\n\n" + "x".repeat(3000);

        List<String> chunks = service.chunk(text);

        assertFalse(chunks.isEmpty());
        // The early boundary is honoured: the first chunk is the short intro.
        assertEquals("Intro.", chunks.get(0));
        // The remaining long body is captured across subsequent chunks.
        assertTrue(chunks.stream().anyMatch(c -> c.contains("xxxx")));
    }

    @Test
    void whitespaceOnlySpanBetweenBoundariesIsSkipped() {
        // The large blank gap yields a whitespace-only span that must be dropped.
        String text = "First sentence. " + " ".repeat(1500) + "Second sentence.";

        List<String> chunks = service.chunk(text);

        assertAll(
            () -> chunks.forEach(c -> assertFalse(c.isBlank(), "blank chunks must be skipped")),
            () -> assertTrue(chunks.stream().anyMatch(c -> c.contains("First sentence."))),
            () -> assertTrue(chunks.stream().anyMatch(c -> c.contains("Second sentence.")))
        );
    }
}
