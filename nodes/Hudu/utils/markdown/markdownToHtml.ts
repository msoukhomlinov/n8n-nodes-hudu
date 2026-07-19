import { marked } from 'marked';

/**
 * Markdown → HTML converter (marked v4, CJS). `mangle`/`headerIds` disabled for
 * clean Hudu-editor HTML and to silence v4 deprecation warnings.
 */
marked.use({ mangle: false, headerIds: false });

export function convertMarkdownToHtml(md: string): string {
  if (!md || typeof md !== 'string') {
    return '';
  }
  try {
    return marked.parse(md) as string;
  } catch {
    return md;
  }
}
