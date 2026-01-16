import { convertHtmlToMarkdown } from './htmlToMarkdown';

/**
 * Utility functions for markdown conversion and processing
 */

/**
 * Processes article content to optionally include markdown version
 * @param article The article object from the API response
 * @param includeMarkdown Whether to include markdown content
 * @returns The processed article object
 */
export function processArticleContent(article: any, includeMarkdown: boolean = false): any {
  if (!article || typeof article !== 'object') {
    return article;
  }

  const processedArticle = { ...article };

  // If markdown is requested and the article has HTML content
  if (includeMarkdown && article.content) {
    processedArticle.markdown_content = convertHtmlToMarkdown(article.content);
  }

  return processedArticle;
}

/**
 * Processes multiple articles to optionally include markdown versions
 * @param articles Array of article objects from the API response
 * @param includeMarkdown Whether to include markdown content
 * @returns The processed articles array
 */
export function processArticlesContent(articles: any[], includeMarkdown: boolean = false): any[] {
  if (!Array.isArray(articles)) {
    return articles;
  }

  return articles.map(article => processArticleContent(article, includeMarkdown));
}
