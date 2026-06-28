/** Extract cited section labels from an answer, de-duplicated in order. */
export function extractCitations(answer: string): string[] {
  const re = /\[Source:\s*([^\]]+)\]/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer)) !== null) {
    const label = m[1].trim();
    if (!out.includes(label)) out.push(label);
  }
  return out;
}
