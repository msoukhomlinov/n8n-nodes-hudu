export interface MarkdownChunk {
  heading: string | null; // null for the preamble chunk
  level: number;          // 1–6; 0 for preamble
  content: string;        // chunk markdown, including its heading line
}

/**
 * Splits markdown into chunks at ATX headings. Fenced code blocks are respected
 * (a `#` inside a ``` fence never starts a chunk). Content before the first
 * heading becomes a preamble chunk (heading null, level 0). Empty chunks dropped.
 */
export function chunkByHeading(md: string): MarkdownChunk[] {
  if (!md || typeof md !== 'string') return [];
  const lines = md.split('\n');
  const chunks: MarkdownChunk[] = [];
  let inFence = false;
  let fenceChar = '';
  let current: MarkdownChunk | null = null;
  let buf: string[] = [];

  const flush = () => {
    if (current) {
      current.content = buf.join('\n').trim();
      if (current.content) chunks.push(current);
    }
    buf = [];
  };

  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const ch = fence[1][0];
      if (!inFence) { inFence = true; fenceChar = ch; }
      else if (ch === fenceChar) { inFence = false; fenceChar = ''; }
    }

    const heading = !inFence ? line.match(/^(#{1,6})\s+(.*)$/) : null;
    if (heading) {
      flush();
      current = { heading: heading[2].trim(), level: heading[1].length, content: '' };
      buf.push(line);
    } else {
      if (!current) current = { heading: null, level: 0, content: '' };
      buf.push(line);
    }
  }
  flush();
  return chunks;
}
