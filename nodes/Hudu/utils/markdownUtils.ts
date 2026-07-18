import { convertHtmlToMarkdown } from './markdown/htmlToMarkdown';
import { buildFrontmatter } from './markdown/frontmatter';
import { chunkByHeading } from './markdown/chunk';
import type { IDataObject } from 'n8n-workflow';

/**
 * Utility functions for markdown conversion and processing
 */

/**
 * Processes article content to optionally include markdown version
 * @param article The article object from the API response
 * @param includeMarkdown Whether to include markdown content
 * @param includeFrontmatter Whether to prepend a YAML frontmatter block to the markdown content
 * @returns The processed article object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processArticleContent(article: any, includeMarkdown = false, includeFrontmatter = false): any {
  if (!article || typeof article !== 'object') return article;
  const processed = { ...article };
  if (includeMarkdown && article.content) {
    let md = convertHtmlToMarkdown(article.content);
    if (includeFrontmatter) {
      const fm = buildFrontmatter({
        title: article.name ?? null,
        url: article.url ?? null,
        company_id: article.company_id ?? null,
        folder_id: article.folder_id ?? null,
        updated_at: article.updated_at ?? null,
      });
      md = `${fm}\n${md}`;
    }
    processed.markdown_content = md;
  }
  return processed;
}

/**
 * Processes multiple articles to optionally include markdown versions
 * @param articles Array of article objects from the API response
 * @param includeMarkdown Whether to include markdown content
 * @param includeFrontmatter Whether to prepend a YAML frontmatter block to the markdown content
 * @returns The processed articles array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processArticlesContent(articles: any[], includeMarkdown = false, includeFrontmatter = false): any[] {
  if (!Array.isArray(articles)) return articles;
  return articles.map((a) => processArticleContent(a, includeMarkdown, includeFrontmatter));
}

/**
 * Expands one article into one IDataObject per heading chunk, carrying flat
 * source metadata (the vector-store citation fields) onto every chunk.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildArticleChunks(article: any): IDataObject[] {
  const md = article?.content ? convertHtmlToMarkdown(article.content) : '';
  const chunks = chunkByHeading(md);
  return chunks.map((c, idx) => ({
    chunk_index: idx,
    chunk_count: chunks.length,
    heading: c.heading,
    heading_level: c.level,
    markdown: c.content,
    source_type: 'article',
    source_id: article.id ?? null,
    title: article.name ?? null,
    url: article.url ?? null,
    company_id: article.company_id ?? null,
    folder_id: article.folder_id ?? null,
    updated_at: article.updated_at ?? null,
  }));
}
