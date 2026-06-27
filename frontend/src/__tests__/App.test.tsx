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

  it('locks the Ask mode on first load', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: /ask questions/i })).toBeDisabled();
    expect(screen.queryByLabelText(/your question/i)).toBeNull();
  });

  it('reveals the query workspace after a successful ingestion', async () => {
    render(<App />);
    await ingestDocument();

    await waitFor(() => {
      expect(screen.getByText(/AtlasFlow README is ready/i)).toBeTruthy();
    });
    expect(screen.getByLabelText(/your question/i)).toBeTruthy();
    expect(screen.getByRole('tab', { name: /ask questions/i })).not.toBeDisabled();
  });

  it('lets the user switch back to Ask after choosing Add document (no re-lock)', async () => {
    render(<App />);
    await ingestDocument();
    await waitFor(() => screen.getByLabelText(/your question/i));

    // Go to upload mode...
    await userEvent.click(screen.getByRole('tab', { name: /add document/i }));
    expect(screen.getByLabelText(/document title/i)).toBeTruthy();
    expect(screen.queryByLabelText(/your question/i)).toBeNull();

    // ...then change mind and return to Ask — it must NOT be locked.
    const askTab = screen.getByRole('tab', { name: /ask questions/i });
    expect(askTab).not.toBeDisabled();
    await userEvent.click(askTab);
    expect(screen.getByLabelText(/your question/i)).toBeTruthy();
  });
});
