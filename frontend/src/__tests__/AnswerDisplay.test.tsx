import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnswerDisplay } from '../components/AnswerDisplay';
import type { QueryResult } from '../types';

const mockResult: QueryResult = {
  response: {
    answer: 'The API uses OAuth 2.0 for authentication.',
    sourcesUsed: 3,
    question: 'How do I authenticate?',
  },
  latencyMs: 1234,
};

describe('AnswerDisplay', () => {
  it('renders empty state by default', () => {
    render(<AnswerDisplay result={null} loading={false} error={null} />);
    expect(screen.getByText(/ready to answer/i)).toBeTruthy();
  });

  it('renders loading state', () => {
    render(<AnswerDisplay result={null} loading={true} error={null} />);
    expect(screen.getByRole('status')).toBeTruthy();
    // Loading container has aria-label="Generating answer"
    expect(screen.getByRole('status', { name: /generating answer/i })).toBeTruthy();
  });

  it('renders error state', () => {
    render(<AnswerDisplay result={null} loading={false} error="Backend is offline" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Backend is offline/)).toBeTruthy();
  });

  it('renders answer text', () => {
    render(<AnswerDisplay result={mockResult} loading={false} error={null} />);
    expect(screen.getByText(/OAuth 2\.0/)).toBeTruthy();
  });

  it('renders source chunk count', () => {
    render(<AnswerDisplay result={mockResult} loading={false} error={null} />);
    // "3 source chunks used" appears in the sources badge
    expect(screen.getByText(/3 source chunks used/i)).toBeTruthy();
  });

  it('renders latency', () => {
    render(<AnswerDisplay result={mockResult} loading={false} error={null} />);
    // 1234ms → "1.2s"
    expect(screen.getByText('1.2s')).toBeTruthy();
  });

  it('renders no-context warning when sourcesUsed is 0', () => {
    const noContextResult: QueryResult = {
      ...mockResult,
      response: { ...mockResult.response, sourcesUsed: 0 },
    };
    render(<AnswerDisplay result={noContextResult} loading={false} error={null} />);
    expect(screen.getByRole('note')).toBeTruthy();
    expect(screen.getByText(/no relevant context found/i)).toBeTruthy();
  });

  it('renders the echoed question', () => {
    render(<AnswerDisplay result={mockResult} loading={false} error={null} />);
    // Question is displayed in italics as the user's question
    const questionEl = screen.getByText('How do I authenticate?');
    expect(questionEl).toBeTruthy();
  });
});
