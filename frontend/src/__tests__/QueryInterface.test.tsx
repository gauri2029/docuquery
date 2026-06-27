import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryInterface } from '../components/QueryInterface';

describe('QueryInterface', () => {
  const onSubmit = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('shows validation error for empty question', async () => {
    render(<QueryInterface loading={false} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /ask docuquery/i }));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/please enter a question/i)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with trimmed question', async () => {
    render(<QueryInterface loading={false} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/your question/i), 'What is RAG?');
    await userEvent.click(screen.getByRole('button', { name: /ask docuquery/i }));
    expect(onSubmit).toHaveBeenCalledWith('What is RAG?');
  });

  it('submits on Enter key', async () => {
    render(<QueryInterface loading={false} onSubmit={onSubmit} />);
    const textarea = screen.getByLabelText(/your question/i);
    await userEvent.type(textarea, 'What is RAG?');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('What is RAG?');
  });

  it('disables textarea when loading', () => {
    render(<QueryInterface loading={true} onSubmit={onSubmit} />);
    expect(screen.getByLabelText(/your question/i)).toBeDisabled();
  });

  it('shows loading text on button when loading', () => {
    render(<QueryInterface loading={true} onSubmit={onSubmit} />);
    expect(screen.getByRole('button', { name: /searching documents/i })).toBeTruthy();
  });

  it('populates the question from an Explore topic chip without submitting', async () => {
    render(<QueryInterface loading={false} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /features/i }));
    expect(screen.getByLabelText(/your question/i)).toHaveValue(
      'What are the main features described in this document?',
    );
    // Picking a topic must not submit the query.
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
