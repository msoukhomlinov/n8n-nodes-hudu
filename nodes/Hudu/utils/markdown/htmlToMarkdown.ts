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
