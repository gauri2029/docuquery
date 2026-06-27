# DocuQuery Frontend

A React + TypeScript + Vite + Tailwind CSS UI for the DocuQuery RAG backend.

## Overview

The frontend connects to the existing Spring Boot API at `localhost:8080` (via a Vite dev proxy to avoid CORS issues). It provides:

- **Document ingestion** — upload a text/Markdown file (or paste text), give it a title, embed it into the knowledge base. Files are read in the browser and sent as text to the existing `{ title, content }` endpoint — no backend change. Supported: `.txt, .md, .markdown, .csv, .json, .log, .rst, .html` (max 5 MB). Binary formats (PDF, DOCX) are not supported.
- **Natural-language querying** — ask questions, see AI-generated answers with source-chunk counts
- **Document library** — view and delete ingested documents
- **Live backend status** — polls `/api/v1/health` every 30 seconds

## Prerequisites

- Node.js ≥ 20
- The DocuQuery Spring Boot backend running on port 8080

## Setup

```bash
cd frontend
cp .env.example .env
npm install
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `""` | Backend origin. Leave empty in dev (Vite proxy handles it). Set to `http://host:8080` for production builds. |

The Vite dev server proxies all `/api/*` requests to `http://localhost:8080`, so CORS is not an issue during development.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on `http://localhost:5173` |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with oxlint |

## Running locally (full stack)

```bash
# 1. Start all backend services (Postgres, ChromaDB, Spring Boot, Prometheus, Grafana)
docker compose up

# 2. In a separate terminal, start the frontend dev server
cd frontend && npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Docker build (standalone)

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -t docuquery-frontend \
  frontend/

docker run -p 3001:80 docuquery-frontend
```

> **Note:** Port 3000 is already used by Grafana in the Docker Compose stack, so the frontend container runs on 3001.

## Project structure

```
src/
├── api/
│   └── docuquery.ts        # Typed API client (fetch wrapper)
├── components/
│   ├── ui/                 # Button, Card, Spinner primitives
│   ├── Header.tsx
│   ├── StatusIndicator.tsx
│   ├── IngestPanel.tsx
│   ├── QueryInterface.tsx
│   ├── AnswerDisplay.tsx
│   └── DocumentList.tsx
├── hooks/
│   ├── useHealth.ts        # Polls /api/v1/health every 30s
│   └── useDocuments.ts     # Loads and manages the document list
├── types/
│   └── index.ts            # TypeScript interfaces matching backend DTOs
└── __tests__/              # Vitest + React Testing Library
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Status badge shows "Backend offline" | Spring Boot not running | `docker compose up` |
| Ingestion returns 500 | OpenAI API key missing | Set `OPENAI_API_KEY` env var for Docker Compose |
| `npm run dev` fails | Node version too old | Upgrade to Node ≥ 20 |
| Tests fail with "matchers" import error | Jest-dom version mismatch | `npm install` to sync lockfile |
