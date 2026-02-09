package com.docuquery.docuquery.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String filename;
    private int chunkCount;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public int getChunkCount() { return chunkCount; }
    public void setChunkCount(int chunkCount) { this.chunkCount = chunkCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}