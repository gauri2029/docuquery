import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from '../components/Markdown';

describe('Markdown', () => {
  it('renders bold markdown as <strong>, not raw asterisks', () => {
    const { container } = render(<Markdown content="This is **important** text." />);
    expect(container.querySelector('strong')?.textContent).toBe('important');
    expect(container.textContent).not.toContain('**');
  });

  it('renders inline code and list items', () => {
    const { container } = render(<Markdown content={'Run `npm test`\n\n- one\n- two'} />);
    expect(container.querySelector('code')?.textContent).toBe('npm test');
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders [Source: …] as a citation chip', () => {
    render(<Markdown content="Indexing is async [Source: Search and Retrieval]." />);
    const chip = screen.getByText(/Source: Search and Retrieval/);
    expect(chip.className).toContain('citation-chip');
  });
});
