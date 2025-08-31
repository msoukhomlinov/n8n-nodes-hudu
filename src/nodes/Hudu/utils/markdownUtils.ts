import TurndownService from 'turndown';

/**
 * Utility functions for markdown conversion and processing
 */

/**
 * Creates and configures a Turndown service for HTML to markdown conversion
 * @returns Configured Turndown service instance
 */
function createTurndownService(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx', // Use # style headings
    hr: '---', // Use --- for horizontal rules
    bulletListMarker: '-', // Use - for bullet lists
    codeBlockStyle: 'fenced', // Use ``` for code blocks
    fence: '```', // Use ``` for code fences
    emDelimiter: '_', // Use _ for emphasis
    strongDelimiter: '**', // Use ** for strong
    linkStyle: 'inlined', // Inline links
    linkReferenceStyle: 'full', // Full reference style
    br: '  ', // Two spaces for line breaks
    blankReplacement: (content, node) => {
      // Preserve blank lines in certain contexts
      return node.isBlock ? '\n\n' : '';
    },
    keepReplacement: (content, node) => {
      // Keep certain elements as-is if they don't convert well
      return node.isBlock ? `\n\n${content}\n\n` : content;
    },
    defaultReplacement: (content, node) => {
      // Default handling for unrecognized elements
      return node.isBlock ? `\n\n${content}\n\n` : content;
    },
  });

  // Add custom rules for better conversion
  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: (content) => `~~${content}~~`,
  });

  turndownService.addRule('underline', {
    filter: ['u'],
    replacement: (content) => `_${content}_`,
  });

  // Remove empty paragraphs and excessive whitespace
  turndownService.addRule('cleanup', {
    filter: 'p',
    replacement: (content) => {
      const trimmed = content.trim();
      return trimmed ? `\n\n${trimmed}\n\n` : '';
    },
  });

  return turndownService;
}

/**
 * Converts HTML content to markdown format using Turndown
 * @param htmlContent The HTML content to convert
 * @returns The converted markdown content
 */
export function convertHtmlToMarkdown(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  try {
    const turndownService = createTurndownService();
    const markdown = turndownService.turndown(htmlContent);

    // Clean up excessive whitespace
    return markdown
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
      .trim();

  } catch (error) {
    // If conversion fails, log the error and return the original HTML
    console.warn('Failed to convert HTML to markdown:', error);
    return htmlContent;
  }
}

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
