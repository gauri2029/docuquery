import type { ReactNode } from 'react';

/**
 * Tiny, dependency-free Markdown renderer for LLM answers. Handles the subset
 * the model actually emits: headings, bold/italic, inline code, fenced code,
 * ordered/unordered lists, links, and [Source: …] citations. It builds React
 * nodes (no raw HTML injection), so it is safe by construction.
 *
 * When `citationOrder` is provided, [Source: X] renders as a numbered marker
 * linked to the evidence panel; otherwise it falls back to a labelled chip.
 */

interface MarkdownOptions {
  citationOrder?: string[];
  onCiteClick?: (n: number) => void;
}

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[Source:[^\]]+\])|(\[[^\]]+\]\([^)]+\))|(\*[^*\n]+\*)/g;

function renderInline(text: string, keyBase: string, opts: MarkdownOptions): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;

  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i}`;

    if (tok.startsWith('`')) {
      nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith('**')) {
      nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('[Source:')) {
      const label = tok.slice(1, -1).replace(/^Source:\s*/i, '').trim();
      const n = opts.citationOrder ? opts.citationOrder.indexOf(label) + 1 : 0;
      if (opts.citationOrder && n > 0) {
        nodes.push(
          <sup
            key={key}
            role="button"
            tabIndex={0}
            title={`Source: ${label}`}
            className="cite-marker"
            onClick={() => opts.onCiteClick?.(n)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') opts.onCiteClick?.(n);
            }}
          >
            {n}
          </sup>,
        );
      } else {
        nodes.push(
          <span key={key} className="citation-chip">
            {tok.slice(1, -1)}
          </span>,
        );
      }
    } else if (tok.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      if (lm) {
        nodes.push(
          <a key={key} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2 hover:text-brand-800">
            {lm[1]}
          </a>,
        );
      }
    } else if (tok.startsWith('*')) {
      nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }

    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const isListItem = (line: string) => /^\s*[-*]\s+/.test(line);
const isOrderedItem = (line: string) => /^\s*\d+\.\s+/.test(line);

export function Markdown({ content, citationOrder, onCiteClick }: { content: string } & MarkdownOptions) {
  const opts: MarkdownOptions = { citationOrder, onCiteClick };
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={k++} className="md-pre">
          <code>{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const cls = h[1].length <= 2 ? 'text-[15px] font-semibold text-ink mt-3' : 'text-sm font-semibold text-ink mt-2';
      blocks.push(
        <p key={k} className={cls}>
          {renderInline(h[2], `h${k++}`, opts)}
        </p>,
      );
      i++;
      continue;
    }

    if (isListItem(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && isListItem(lines[i])) {
        items.push(<li key={items.length}>{renderInline(lines[i].replace(/^\s*[-*]\s+/, ''), `ul${k}-${items.length}`, opts)}</li>);
        i++;
      }
      blocks.push(<ul key={k++}>{items}</ul>);
      continue;
    }

    if (isOrderedItem(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && isOrderedItem(lines[i])) {
        items.push(<li key={items.length}>{renderInline(lines[i].replace(/^\s*\d+\.\s+/, ''), `ol${k}-${items.length}`, opts)}</li>);
        i++;
      }
      blocks.push(<ol key={k++} className="list-decimal">{items}</ol>);
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !isListItem(lines[i]) &&
      !isOrderedItem(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(<p key={k}>{renderInline(para.join(' '), `p${k++}`, opts)}</p>);
  }

  return <div className="answer-prose text-sm text-ink leading-relaxed">{blocks}</div>;
}
