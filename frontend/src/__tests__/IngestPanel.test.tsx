import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IngestPanel } from '../components/IngestPanel';

vi.mock('../api/docuquery', () => ({
  docuqueryApi: {
    ingest: vi.fn(),
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

/** Switch the panel to the "Paste text" tab so the content textarea is visible. */
async function openPasteTab() {
  await userEvent.click(screen.getByRole('tab', { name: /paste text/i }));
}

describe('IngestPanel', () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation error when title is empty', async () => {
    render(<IngestPanel onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));
    expect(screen.getByText('Title is required')).toBeTruthy();
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it('shows validation error when content is too short', async () => {
    render(<IngestPanel onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/document title/i), 'My Doc');
    await openPasteTab();
    await userEvent.type(screen.getByLabelText(/content/i), 'Short');
    await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));
    expect(screen.getByText(/too short/i)).toBeTruthy();
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it('calls onSuccess with the API result on a valid submit', async () => {
    const mockResult = { documentId: 1, title: 'Test Doc', chunksCreated: 3 };
    mockIngest.mockResolvedValueOnce(mockResult);

    render(<IngestPanel onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/document title/i), 'Test Doc');
    await openPasteTab();
    await userEvent.type(
      screen.getByLabelText(/content/i),
      'This is a long enough document content for testing purposes.',
    );
    await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  it('reads an uploaded text file into the content field and auto-fills the title', async () => {
    render(<IngestPanel onSuccess={onSuccess} />);
    const file = new File(['Embeddings power semantic search across documents.'], 'guide.md', {
      type: 'text/markdown',
    });
    // Upload tab is the default.
    await userEvent.upload(screen.getByLabelText(/choose a file/i), file);

    await waitFor(() => {
      // Title is derived from the filename without its extension.
      expect((screen.getByLabelText(/document title/i) as HTMLInputElement).value).toBe('guide');
      expect(screen.getByText('guide.md')).toBeTruthy();
    });

    // The file's text is placed into the (paste-tab) content field.
    await openPasteTab();
    expect((screen.getByLabelText(/content/i) as HTMLTextAreaElement).value).toMatch(
      /Embeddings power semantic search/,
    );
  });

  it('rejects an unsupported file type', async () => {
    render(<IngestPanel onSuccess={onSuccess} />);
    const file = new File(['%PDF-1.4 binary'], 'report.pdf', { type: 'application/pdf' });
    // applyAccept: false bypasses the input's accept filter so we exercise the
    // JS-level guard (the same guard that protects the drag-and-drop path).
    await userEvent.upload(screen.getByLabelText(/choose a file/i), file, { applyAccept: false });

    await waitFor(() => {
      expect(screen.getByText(/Unsupported file type/i)).toBeTruthy();
    });
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it('shows API error on failure', async () => {
    const { ApiError } = await import('../api/docuquery');
    mockIngest.mockRejectedValueOnce(new ApiError(500, 'Internal server error'));

    render(<IngestPanel onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/document title/i), 'Test Doc');
    await openPasteTab();
    await userEvent.type(
      screen.getByLabelText(/content/i),
      'This is a long enough document content for testing purposes.',
    );
    await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));

    await waitFor(() => {
      expect(screen.getByText(/Internal server error/i)).toBeTruthy();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
