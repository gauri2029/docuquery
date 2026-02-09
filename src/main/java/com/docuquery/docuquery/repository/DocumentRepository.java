package com.docuquery.docuquery.repository;

import com.docuquery.docuquery.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}