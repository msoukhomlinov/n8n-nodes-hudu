import { convertHtmlToMarkdown, looksLikeHtml } from './htmlToMarkdown';

/**
 * Adds a sibling `markdown` key to each entry in asset.fields (shape: { id, label,
 * value, position }, per IAssetField) whose `value` is a string that looksLikeHtml.
 * Non-HTML/plain-text values are left untouched. Shared by the regular node's
 * assets.handler.ts and the AI-tools result-processor so both behave identically.
 * See looksLikeHtml() for the heuristic's known limits.
 */
export function addAssetFieldMarkdown<T extends Record<string, unknown>>(asset: T): T {
  if (!Array.isArray((asset as Record<string, unknown>).fields)) return asset;

  const fields = ((asset as Record<string, unknown>).fields as Record<string, unknown>[]).map((field) => {
    const value = field?.value;
    if (typeof value === 'string' && looksLikeHtml(value)) {
      return { ...field, markdown: convertHtmlToMarkdown(value) };
    }
    return field;
  });

  return { ...asset, fields } as T;
}
