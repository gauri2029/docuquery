import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

vi.mock('../api/docuquery', () => ({
  docuqueryApi: {
    ingest: vi.fn(),
    query: vi.fn(),
    listDocuments: vi.fn().mockResolvedValue([]),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

import { docuqueryApi } from '../api/docuquery';

const mockIngest = vi.mocked(docuqueryApi.ingest);
const mockQuery = vi.mocked(docuqueryApi.query);

async function ingestDocument(title = 'AtlasFlow README') {
  mockIngest.mockResolvedValueOnce({ documentId: 1, title, chunksCreated: 5 });
  await userEvent.type(screen.getByLabelText(/document title/i), title);
  await userEvent.click(screen.getByRole('tab', { name: /paste text/i }));
  await userEvent.type(
    screen.getByLabelText(/content/i),
    'When a document changes, the Document Service publishes an event and the Search Service reindexes.',
  );
  await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));
}

describe('App workspace', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the onboarding add-document state on first load', () => {
    render(<App />);
    expect(screen.getByText(/add a document to begin/i)).toBeTruthy();
    expect(screen.getByLabelText(/document title/i)).toBeTruthy();
    expect(screen.queryByLabelText(/your question/i)).toBeNull();
  });

  it('reveals the conversation workspace after ingestion', async () => {
    render(<App />);
    await ingestDocument();
    await waitFor(() => {
      expect(screen.getByLabelText(/your question/i)).toBeTruthy();
    });
  });

  it('scopes the query to the active document after ingestion', async () => {
    mockQuery.mockResolvedValueOnce({ answer: 'Async indexing.', sourcesUsed: 2, question: 'How?' });
    render(<App />);
    await ingestDocument();
    await waitFor(() => screen.getByLabelText(/your question/i));

    await userEvent.type(screen.getByLabelText(/your question/i), 'How does indexing work?');
    await userEvent.click(screen.getByRole('button', { name: /ask docuquery/i }));

    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ documentId: '1' }),
        expect.anything(),
      );
    });
  });
});
