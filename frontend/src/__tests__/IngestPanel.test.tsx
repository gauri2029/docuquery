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

  it('shows validation error when content is empty', async () => {
    render(<IngestPanel onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/document title/i), 'My Doc');
    await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));
    expect(screen.getByText('Content is required')).toBeTruthy();
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it('shows validation error when content is too short', async () => {
    render(<IngestPanel onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/document title/i), 'My Doc');
    await userEvent.type(screen.getByLabelText(/content/i), 'Short');
    await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));
    expect(screen.getByText(/too short/i)).toBeTruthy();
  });

  it('calls API and shows success message', async () => {
    const mockResult = { documentId: 1, title: 'Test Doc', chunksCreated: 3 };
    mockIngest.mockResolvedValueOnce(mockResult);

    render(<IngestPanel onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/document title/i), 'Test Doc');
    await userEvent.type(
      screen.getByLabelText(/content/i),
      'This is a long enough document content for testing purposes.',
    );
    await userEvent.click(screen.getByRole('button', { name: /ingest document/i }));

    await waitFor(() => {
      expect(screen.getByText(/"Test Doc" ingested/i)).toBeTruthy();
      expect(screen.getByText(/3 chunks created/i)).toBeTruthy();
    });
    expect(onSuccess).toHaveBeenCalledWith(mockResult);
  });

  it('reads an uploaded text file into the content field and auto-fills the title', async () => {
    render(<IngestPanel onSuccess={onSuccess} />);
    const file = new File(['Embeddings power semantic search across documents.'], 'guide.md', {
      type: 'text/markdown',
    });
    await userEvent.upload(screen.getByLabelText(/choose a file/i), file);

    await waitFor(() => {
      expect((screen.getByLabelText(/content/i) as HTMLTextAreaElement).value).toMatch(
        /Embeddings power semantic search/,
      );
      // Title is derived from the filename without its extension.
      expect((screen.getByLabelText(/document title/i) as HTMLInputElement).value).toBe('guide');
      expect(screen.getByText('guide.md')).toBeTruthy();
    });
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
