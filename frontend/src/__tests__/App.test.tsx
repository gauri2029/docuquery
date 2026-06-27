import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

vi.mock('../api/docuquery', () => ({
  docuqueryApi: {
    ingest: vi.fn(),
    query: vi.fn(),
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

describe('App workflow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts with the query step locked', () => {
    render(<App />);
    expect(screen.getByText(/ingest a document to start asking questions/i)).toBeTruthy();
    // The question input is not present until a document is ingested.
    expect(screen.queryByLabelText(/your question/i)).toBeNull();
  });

  it('reveals the query workspace after a successful ingestion', async () => {
    render(<App />);
    await ingestDocument();

    await waitFor(() => {
      expect(screen.getByText(/AtlasFlow README is ready/i)).toBeTruthy();
    });
    // Query input is now available and the locked message is gone.
    expect(screen.getByLabelText(/your question/i)).toBeTruthy();
    expect(screen.queryByText(/ingest a document to start asking questions/i)).toBeNull();
  });

  it('returns to the locked state when starting over', async () => {
    render(<App />);
    await ingestDocument();
    await waitFor(() => screen.getByLabelText(/your question/i));

    await userEvent.click(screen.getByRole('button', { name: /use another document/i }));

    expect(screen.getByText(/ingest a document to start asking questions/i)).toBeTruthy();
    expect(screen.queryByLabelText(/your question/i)).toBeNull();
  });
});
