import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * HTML → Markdown converter for Hudu content (turndown + GFM plugin).
 * Same public signature as the previous regex converter so callers are unchanged.
 */
const service = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
});
service.use(gfm);

// turndown-plugin-gfm@1.0.2's strikethrough rule emits single-tilde (`~text~`);
// override with the GFM spec's double-tilde delimiter (`~~text~~`). addRule()
// unshifts, so this takes precedence over the plugin's rule of the same name.
service.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: (content) => `~~${content}~~`,
});

export function convertHtmlToMarkdown(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  try {
    return service.turndown(html);
  } catch {
    // Conversion failed — return original HTML unchanged (matches prior behaviour).
    return html;
  }
}

/**
 * Heuristic: does this value contain HTML element markup? Used to decide which
 * asset RichText field values to convert. Known limits: a plain-text field
 * containing a single-token angle-bracket form like <TODO>, <name>, or <token>
 * is a false positive; plain text without tags is a false negative but is
 * already valid Markdown, so benign.
 */
export function looksLikeHtml(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return /<([a-z][a-z0-9]*)(\s[^>]*)?>/i.test(value);
}
