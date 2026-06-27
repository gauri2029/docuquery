import type { ReactNode } from 'react';

/**
 * Tiny, dependency-free Markdown renderer for LLM answers. Handles the subset
 * the model actually emits: headings, bold/italic, inline code, fenced code,
 * ordered/unordered lists, links, and [Source: …] citation chips. It builds
 * React nodes (no raw HTML injection), so it is safe by construction.
 */

// One alternation that matches the next inline token, in priority order.
const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[Source:[^\]]+\])|(\[[^\]]+\]\([^)]+\))|(\*[^*\n]+\*)/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
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
      nodes.push(
        <span key={key} className="citation-chip">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {tok.slice(1, -1)}
        </span>,
      );
    } else if (tok.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      if (lm) {
        nodes.push(
          <a key={key} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2 hover:text-brand-700">
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

function isListItem(line: string) {
  return /^\s*[-*]\s+/.test(line);
}
function isOrderedItem(line: string) {
  return /^\s*\d+\.\s+/.test(line);
}

export function Markdown({ content }: { content: string }) {
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

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre key={k++} className="md-pre">
          <code>{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const cls = h[1].length <= 2 ? 'text-[15px] font-semibold text-slate-900 mt-3' : 'text-sm font-semibold text-slate-900 mt-2';
      blocks.push(
        <p key={k} className={cls}>
          {renderInline(h[2], `h${k++}`)}
        </p>,
      );
      i++;
      continue;
    }

    // Unordered list
    if (isListItem(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && isListItem(lines[i])) {
        items.push(<li key={items.length}>{renderInline(lines[i].replace(/^\s*[-*]\s+/, ''), `ul${k}-${items.length}`)}</li>);
        i++;
      }
      blocks.push(<ul key={k++}>{items}</ul>);
      continue;
    }

    // Ordered list
    if (isOrderedItem(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && isOrderedItem(lines[i])) {
        items.push(<li key={items.length}>{renderInline(lines[i].replace(/^\s*\d+\.\s+/, ''), `ol${k}-${items.length}`)}</li>);
        i++;
      }
      blocks.push(<ol key={k++} className="list-decimal">{items}</ol>);
      continue;
    }

    // Paragraph — gather consecutive non-structural lines
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
    blocks.push(<p key={k}>{renderInline(para.join(' '), `p${k++}`)}</p>);
  }

  return <div className="answer-prose text-sm text-slate-800 leading-relaxed">{blocks}</div>;
}
