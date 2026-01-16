/**
 * HTML to Markdown Converter
 *
 * This implementation adapts conversion rules from turndown (MIT License)
 * Copyright (c) 2017 Dom Christie
 * https://github.com/mixmark-io/turndown
 *
 * Adapted for regex-based parsing to avoid external dependencies.
 * Handles common HTML elements found in CMS-generated content like Hudu articles.
 *
 * Supported elements:
 * - Headings (h1-h6)
 * - Paragraphs, divs, line breaks
 * - Bold, italic, underline, strikethrough
 * - Links (with nested formatting support)
 * - Images (with alt text and titles)
 * - Code blocks and inline code (with language extraction)
 * - Ordered and unordered lists (nested)
 * - Blockquotes (nested)
 * - Horizontal rules
 * - Tables (GFM format with alignment)
 * - Definition lists
 * - Subscript/superscript
 * - Task lists/checkboxes
 * - Figure/figcaption
 */

/**
 * Comprehensive HTML entity map including named and common entities
 */
const HTML_ENTITIES: Record<string, string> = {
  // Basic entities
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  // Whitespace
  '&nbsp;': ' ',
  '&ensp;': ' ',
  '&emsp;': ' ',
  '&thinsp;': ' ',
  // Punctuation
  '&mdash;': '\u2014',
  '&ndash;': '\u2013',
  '&hellip;': '\u2026',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&bull;': '•',
  '&middot;': '·',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  // Arrows
  '&larr;': '←',
  '&rarr;': '→',
  '&uarr;': '↑',
  '&darr;': '↓',
  // Currency
  '&cent;': '¢',
  '&pound;': '£',
  '&euro;': '€',
  '&yen;': '¥',
  // Math/symbols
  '&para;': '¶',
  '&sect;': '§',
  '&dagger;': '†',
  '&Dagger;': '‡',
  '&laquo;': '«',
  '&raquo;': '»',
  // Accented characters (common ones)
  '&agrave;': 'à',
  '&aacute;': 'á',
  '&acirc;': 'â',
  '&atilde;': 'ã',
  '&auml;': 'ä',
  '&egrave;': 'è',
  '&eacute;': 'é',
  '&ecirc;': 'ê',
  '&euml;': 'ë',
  '&igrave;': 'ì',
  '&iacute;': 'í',
  '&icirc;': 'î',
  '&iuml;': 'ï',
  '&ograve;': 'ò',
  '&oacute;': 'ó',
  '&ocirc;': 'ô',
  '&otilde;': 'õ',
  '&ouml;': 'ö',
  '&ugrave;': 'ù',
  '&uacute;': 'ú',
  '&ucirc;': 'û',
  '&uuml;': 'ü',
  '&ntilde;': 'ñ',
  '&ccedil;': 'ç',
  // Uppercase variants
  '&Agrave;': 'À',
  '&Aacute;': 'Á',
  '&Acirc;': 'Â',
  '&Atilde;': 'Ã',
  '&Auml;': 'Ä',
  '&Egrave;': 'È',
  '&Eacute;': 'É',
  '&Ecirc;': 'Ê',
  '&Euml;': 'Ë',
  '&Igrave;': 'Ì',
  '&Iacute;': 'Í',
  '&Icirc;': 'Î',
  '&Iuml;': 'Ï',
  '&Ograve;': 'Ò',
  '&Oacute;': 'Ó',
  '&Ocirc;': 'Ô',
  '&Otilde;': 'Õ',
  '&Ouml;': 'Ö',
  '&Ugrave;': 'Ù',
  '&Uacute;': 'Ú',
  '&Ucirc;': 'Û',
  '&Uuml;': 'Ü',
  '&Ntilde;': 'Ñ',
  '&Ccedil;': 'Ç',
};

/**
 * Escapes markdown special characters in text content
 * Only escapes characters that would be interpreted as markdown syntax
 */
function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/^-/gm, '\\-')
    .replace(/^\+ /gm, '\\+ ')
    .replace(/^(=+)/gm, '\\$1')
    .replace(/^(#{1,6}) /gm, '\\$1 ')
    .replace(/`/g, '\\`')
    .replace(/^~~~/gm, '\\~~~')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/^>/gm, '\\>')
    .replace(/_/g, '\\_')
    .replace(/^(\d+)\. /gm, '$1\\. ');
}

/**
 * Normalises text content: strips tags, decodes entities, and escapes markdown
 */
function normaliseText(content: string): string {
  return escapeMarkdown(decodeEntities(stripTags(content.trim())));
}

/**
 * Normalises title attribute: decodes entities and escapes quotes
 */
function normaliseTitle(title: string | null): string | null {
  if (!title) return null;
  return decodeEntities(title).replace(/"/g, '\\"');
}

/**
 * Extracts attribute value from HTML tag
 * Handles quoted (single/double) and unquoted attributes
 */
function getAttribute(html: string, attrName: string): string | null {
  // Try quoted attributes first (double or single quotes)
  const quotedRegex = new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, 'i');
  const quotedMatch = html.match(quotedRegex);
  if (quotedMatch) return quotedMatch[1];

  // Try unquoted attributes (value ends at space or >)
  const unquotedRegex = new RegExp(`${attrName}\\s*=\\s*([^\\s>"']+)`, 'i');
  const unquotedMatch = html.match(unquotedRegex);
  if (unquotedMatch) return unquotedMatch[1];

  return null;
}

/**
 * Removes HTML tags and returns text content
 */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Decodes HTML entities including numeric character references
 */
function decodeEntities(text: string): string {
  return text.replace(/&[#\w]+;/gi, (entity) => {
    // Check named entities first
    const named = HTML_ENTITIES[entity];
    if (named) return named;

    // Handle numeric entities (decimal: &#123; or hex: &#x7B;)
    if (entity.startsWith('&#')) {
      try {
        let code: number;
        if (entity.charAt(2).toLowerCase() === 'x') {
          // Hexadecimal: &#x7B;
          code = parseInt(entity.slice(3, -1), 16);
        } else {
          // Decimal: &#123;
          code = parseInt(entity.slice(2, -1), 10);
        }
        if (!isNaN(code) && code > 0) {
          return String.fromCodePoint(code);
        }
      } catch {
        // Invalid entity, return as-is
      }
    }

    return entity;
  });
}

/**
 * Extracts language identifier from code element class attribute
 * Handles: language-xxx, lang-xxx, xxx (if single class)
 */
function extractCodeLanguage(tagHtml: string): string {
  const classAttr = getAttribute(tagHtml, 'class');
  if (!classAttr) return '';

  // Match language-xxx or lang-xxx patterns
  const langMatch = classAttr.match(/(?:language-|lang-)(\w+)/i);
  if (langMatch) return langMatch[1];

  // If single-word class that looks like a language, use it
  const trimmed = classAttr.trim();
  if (/^[a-z]+$/i.test(trimmed) && trimmed.length <= 15) {
    return trimmed.toLowerCase();
  }

  return '';
}

/**
 * Converts an HTML table to GFM (GitHub Flavored Markdown) table format
 * Handles alignment, colspan (basic), and complex cell content
 */
/**
 * Finds the matching closing tag for an opening tag, handling nesting
 * Returns the index after the closing tag, or -1 if not found
 */
function findMatchingCloseTag(html: string, tagName: string, startIndex: number): number {
  const openPattern = new RegExp(`<${tagName}[^>]*>`, 'gi');
  const closePattern = new RegExp(`</${tagName}>`, 'gi');

  let depth = 1;
  let i = startIndex;

  while (i < html.length && depth > 0) {
    // Check for opening tag
    openPattern.lastIndex = i;
    const openMatch = openPattern.exec(html);

    // Check for closing tag
    closePattern.lastIndex = i;
    const closeMatch = closePattern.exec(html);

    if (!closeMatch) {
      return -1; // No closing tag found
    }

    // Determine which comes first
    if (openMatch && openMatch.index < closeMatch.index) {
      depth++;
      i = openMatch.index + openMatch[0].length;
    } else {
      depth--;
      i = closeMatch.index + closeMatch[0].length;
      if (depth === 0) {
        return closeMatch.index + closeMatch[0].length;
      }
    }
  }

  return -1;
}

/**
 * Converts lists by finding balanced tags and using recursion
 * Processes outermost lists first, letting recursion handle nested ones
 */
function processListsBalanced(html: string): string {
  let result = html;
  let changed = true;
  let iterations = 0;
  const maxIterations = 100; // Safety limit

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Find the first list tag
    const listMatch = result.match(/<(ul|ol)([^>]*)>/i);
    if (!listMatch) break;

    const tagName = listMatch[1].toLowerCase();
    const openTag = listMatch[0];
    const openTagStart = listMatch.index!;
    const openTagEnd = openTagStart + openTag.length;

    // Find the matching close tag using balanced matching
    const closeIndex = findMatchingCloseTag(result, tagName, openTagEnd);

    if (closeIndex !== -1) {
      const fullMatch = result.slice(openTagStart, closeIndex);
      const content = result.slice(openTagEnd, closeIndex - `</${tagName}>`.length);
      const replacement = convertListToMarkdown(fullMatch, content, tagName === 'ol');
      result = result.slice(0, openTagStart) + replacement + result.slice(closeIndex);
      changed = true;
    } else {
      // Can't find matching close tag, break to avoid infinite loop
      break;
    }
  }

  return result;
}

/**
 * Extracts list items from list content, handling nested lists correctly
 * Uses a simple depth counter to find matching li tags
 */
function extractListItems(content: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let currentItem = '';
  let inItem = false;
  let i = 0;

  while (i < content.length) {
    // Check for opening li tag
    const liOpenMatch = content.slice(i).match(/^<li[^>]*>/i);
    if (liOpenMatch) {
      if (depth === 0) {
        inItem = true;
        currentItem = '';
      } else {
        currentItem += liOpenMatch[0];
      }
      depth++;
      i += liOpenMatch[0].length;
      continue;
    }

    // Check for closing li tag
    if (content.slice(i, i + 5).toLowerCase() === '</li>') {
      depth--;
      if (depth === 0 && inItem) {
        items.push(currentItem);
        inItem = false;
        currentItem = '';
      } else if (depth > 0) {
        currentItem += '</li>';
      }
      i += 5;
      continue;
    }

    // Add character to current item if we're inside one
    if (inItem) {
      currentItem += content[i];
    }
    i++;
  }

  return items;
}

/**
 * Converts an HTML list to Markdown format
 * Handles nested lists, task lists, and proper indentation
 */
function convertListToMarkdown(fullMatch: string, content: string, isOrdered: boolean): string {
  const items: string[] = [];
  let index = 1;

  // Check for start attribute on ordered lists
  if (isOrdered) {
    const startMatch = fullMatch.match(/<ol[^>]*start=["']?(\d+)["']?/i);
    if (startMatch) {
      index = parseInt(startMatch[1], 10);
    }
  }

  // Extract list items properly (handling nesting)
  const listItems = extractListItems(content);

  for (const itemContent of listItems) {
    // Check for task list checkbox
    const checkboxCheckedMatch = itemContent.match(/^\s*<input[^>]*type=["']checkbox["'][^>]*checked[^>]*>\s*/i) ||
                                  itemContent.match(/^\s*<input[^>]*checked[^>]*type=["']checkbox["'][^>]*>\s*/i);
    const checkboxUncheckedMatch = itemContent.match(/^\s*<input[^>]*type=["']checkbox["'][^>]*>\s*/i);

    let prefix: string;
    let contentToProcess: string;

    if (checkboxCheckedMatch) {
      prefix = '- [x] ';
      contentToProcess = itemContent.slice(checkboxCheckedMatch[0].length);
    } else if (checkboxUncheckedMatch && !checkboxCheckedMatch) {
      prefix = '- [ ] ';
      contentToProcess = itemContent.slice(checkboxUncheckedMatch[0].length);
    } else if (isOrdered) {
      prefix = `${index}. `;
      contentToProcess = itemContent;
      index++;
    } else {
      prefix = '- ';
      contentToProcess = itemContent;
    }

    // Recursively process the item content (handles nested lists)
    const processed = convertHtmlToMarkdown(contentToProcess.trim());
    const lines = processed.split('\n');

    // Filter empty lines but preserve structure
    const nonEmptyLines = lines.filter(l => l.trim());
    if (nonEmptyLines.length > 0) {
      const firstLine = prefix + nonEmptyLines[0];
      const indent = isOrdered ? '   ' : '  ';
      const restLines = nonEmptyLines.slice(1).map(line => indent + line);
      items.push(firstLine + (restLines.length > 0 ? '\n' + restLines.join('\n') : ''));
    }
  }

  return items.length > 0 ? '\n\n' + items.join('\n') + '\n\n' : '';
}

/**
 * Converts an HTML table to GFM (GitHub Flavored Markdown) table format
 * Handles alignment, colspan (basic), and complex cell content
 */
function convertTableToMarkdown(tableHtml: string): string {
  const rows: string[][] = [];
  const alignments: string[] = [];

  // Extract all rows
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let rowIndex = 0;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowContent = rowMatch[1];
    const cells: string[] = [];

    // Extract cells (th or td)
    const cellRegex = /<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const cellTag = cellMatch[0];
      const cellContent = cellMatch[2];

      // Process cell content (recursively convert HTML, but keep it inline)
      const processedContent = convertHtmlToMarkdown(cellContent)
        .replace(/\n+/g, ' ')  // Replace newlines with spaces
        .replace(/\|/g, '\\|') // Escape pipes in content
        .trim();

      cells.push(processedContent);

      // Extract alignment from first row (header)
      if (rowIndex === 0) {
        const style = getAttribute(cellTag, 'style') || '';
        const align = getAttribute(cellTag, 'align') || '';
        const alignValue = style.match(/text-align:\s*(left|center|right)/i)?.[1] || align;

        if (alignValue) {
          alignments.push(alignValue.toLowerCase());
        } else {
          alignments.push('left'); // Default
        }
      }
    }

    if (cells.length > 0) {
      rows.push(cells);
      rowIndex++;
    }
  }

  if (rows.length === 0) return '';

  // Determine column count (max cells in any row)
  const colCount = Math.max(...rows.map(row => row.length));

  // Pad rows to have equal columns
  rows.forEach(row => {
    while (row.length < colCount) {
      row.push('');
    }
  });

  // Pad alignments
  while (alignments.length < colCount) {
    alignments.push('left');
  }

  // Build markdown table
  const lines: string[] = [];

  // Header row (first row)
  if (rows.length > 0) {
    lines.push('| ' + rows[0].join(' | ') + ' |');

    // Separator row with alignment
    const separators = alignments.map(align => {
      switch (align) {
        case 'center': return ':---:';
        case 'right': return '---:';
        default: return '---';
      }
    });
    lines.push('| ' + separators.join(' | ') + ' |');

    // Data rows
    for (let i = 1; i < rows.length; i++) {
      lines.push('| ' + rows[i].join(' | ') + ' |');
    }
  }

  return '\n\n' + lines.join('\n') + '\n\n';
}

/**
 * Converts HTML to Markdown format
 *
 * This regex-based converter handles common HTML elements found in CMS content.
 * It processes elements in a specific order to handle nested structures correctly.
 *
 * @param htmlContent The HTML content to convert
 * @returns The converted markdown content
 */
export function convertHtmlToMarkdown(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  try {
    let markdown = htmlContent;

    // Remove script, style, and comment tags completely
    markdown = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    markdown = markdown.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    markdown = markdown.replace(/<!--[\s\S]*?-->/g, '');
    markdown = markdown.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

    // Convert tables FIRST (before other processing messes with structure)
    markdown = markdown.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match) => {
      return convertTableToMarkdown(match);
    });

    // Convert figure with figcaption
    markdown = markdown.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (match, content) => {
      const imgMatch = content.match(/<img[^>]*>/i);
      const captionMatch = content.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);

      if (imgMatch) {
        const alt = getAttribute(imgMatch[0], 'alt') || '';
        const src = getAttribute(imgMatch[0], 'src') || '';
        const caption = captionMatch ? normaliseText(captionMatch[1]) : '';
        const displayAlt = caption || escapeMarkdown(decodeEntities(alt));
        return src ? `\n\n![${displayAlt}](${src})\n\n` : '';
      }
      // No image, just process content
      return convertHtmlToMarkdown(content);
    });

    // Convert code blocks first (before other processing)
    // Handle pre > code with language detection
    markdown = markdown.replace(/<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi, (match, codeAttrs, code) => {
      const lang = extractCodeLanguage('<code' + codeAttrs + '>');
      const cleanCode = decodeEntities(stripTags(code.trim()));
      // Escape triple backticks if present in code
      const fence = cleanCode.includes('```') ? '````' : '```';
      return `\n\n${fence}${lang}\n${cleanCode}\n${fence}\n\n`;
    });

    // Handle pre without code (preformatted text)
    markdown = markdown.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, content) => {
      const cleanContent = decodeEntities(stripTags(content.trim()));
      const fence = cleanContent.includes('```') ? '````' : '```';
      return `\n\n${fence}\n${cleanContent}\n${fence}\n\n`;
    });

    // Convert inline code
    markdown = markdown.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (match, content) => {
      const cleanContent = decodeEntities(stripTags(content.trim()));
      if (!cleanContent) return '';
      // Handle backticks in code by using more backticks
      let delimiter = '`';
      while (cleanContent.includes(delimiter)) {
        delimiter += '`';
      }
      // Add space padding if content starts/ends with backtick
      const needsPadding = cleanContent.startsWith('`') || cleanContent.endsWith('`');
      return needsPadding
        ? `${delimiter} ${cleanContent} ${delimiter}`
        : `${delimiter}${cleanContent}${delimiter}`;
    });

    // Convert headings (h1-h6)
    markdown = markdown.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi, (match, level, content) => {
      const text = normaliseText(content);
      if (!text) return '';
      const hashes = '#'.repeat(parseInt(level, 10));
      return `\n\n${hashes} ${text}\n\n`;
    });

    // Convert blockquotes (with nested support)
    markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      const text = convertHtmlToMarkdown(content.trim());
      const lines = text.split('\n').filter(line => line.trim() || line === '');
      return '\n\n' + lines.map(line => `> ${line}`).join('\n') + '\n\n';
    });

    // Convert definition lists
    markdown = markdown.replace(/<dl[^>]*>([\s\S]*?)<\/dl>/gi, (match, content) => {
      let result = '\n\n';
      const items = content.match(/<(dt|dd)[^>]*>[\s\S]*?<\/\1>/gi) || [];

      for (const item of items) {
        const dtMatch = item.match(/<dt[^>]*>([\s\S]*?)<\/dt>/i);
        const ddMatch = item.match(/<dd[^>]*>([\s\S]*?)<\/dd>/i);

        if (dtMatch) {
          result += `**${normaliseText(dtMatch[1])}**\n`;
        }
        if (ddMatch) {
          result += `: ${convertHtmlToMarkdown(ddMatch[1].trim()).replace(/\n+/g, ' ')}\n\n`;
        }
      }

      return result;
    });

    // Convert lists using balanced tag matching to handle nesting correctly
    markdown = processListsBalanced(markdown);

    // Convert horizontal rules
    markdown = markdown.replace(/<hr[^>]*\/?>/gi, '\n\n---\n\n');

    // Convert images
    markdown = markdown.replace(/<img[^>]*\/?>/gi, (match) => {
      const alt = escapeMarkdown(decodeEntities(getAttribute(match, 'alt') || ''));
      const src = getAttribute(match, 'src') || '';
      const title = normaliseTitle(getAttribute(match, 'title'));
      const titlePart = title ? ` "${title}"` : '';
      return src ? `![${alt}](${src}${titlePart})` : '';
    });

    // Convert links (with support for nested formatting)
    markdown = markdown.replace(/<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, content) => {
      // For links, we want to preserve nested formatting (bold, italic, etc.)
      // but process it recursively first
      const processedContent = convertHtmlToMarkdown(content)
        .replace(/\n+/g, ' ')  // Links can't have newlines
        .trim();
      const title = normaliseTitle(getAttribute(match, 'title'));
      const titlePart = title ? ` "${title}"` : '';
      // Escape parentheses in URL
      const escapedHref = href.replace(/([()])/g, '\\$1');
      return `[${processedContent}](${escapedHref}${titlePart})`;
    });

    // Handle links without href (anchors) - just return content
    markdown = markdown.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, (match, content) => {
      return convertHtmlToMarkdown(content);
    });

    // Convert subscript
    markdown = markdown.replace(/<sub[^>]*>([\s\S]*?)<\/sub>/gi, (match, content) => {
      const text = normaliseText(content);
      return text ? `~${text}~` : '';
    });

    // Convert superscript
    markdown = markdown.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, (match, content) => {
      const text = normaliseText(content);
      return text ? `^${text}^` : '';
    });

    // Convert mark/highlight
    markdown = markdown.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, (match, content) => {
      const text = normaliseText(content);
      return text ? `==${text}==` : '';
    });

    // Convert abbreviations (keep as text with title if available)
    markdown = markdown.replace(/<abbr[^>]*title=["']([^"']*)["'][^>]*>([\s\S]*?)<\/abbr>/gi, (match, title, content) => {
      const text = normaliseText(content);
      return text ? `${text} (${decodeEntities(title)})` : '';
    });
    markdown = markdown.replace(/<abbr[^>]*>([\s\S]*?)<\/abbr>/gi, (match, content) => {
      return normaliseText(content);
    });

    // Convert strong/bold
    markdown = markdown.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, (match, tag, content) => {
      // Recursively process content to handle nested elements
      const processed = convertHtmlToMarkdown(content).trim();
      return processed ? `**${processed}**` : '';
    });

    // Convert emphasis/italic
    markdown = markdown.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, (match, tag, content) => {
      const processed = convertHtmlToMarkdown(content).trim();
      return processed ? `_${processed}_` : '';
    });

    // Convert strikethrough
    markdown = markdown.replace(/<(del|s|strike)[^>]*>([\s\S]*?)<\/(del|s|strike)>/gi, (match, tag, content) => {
      const processed = convertHtmlToMarkdown(content).trim();
      return processed ? `~~${processed}~~` : '';
    });

    // Convert underline (fallback to emphasis, as markdown has no native underline)
    markdown = markdown.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, (match, content) => {
      const processed = convertHtmlToMarkdown(content).trim();
      return processed ? `_${processed}_` : '';
    });

    // Convert inserted text (like <ins>) to underline/emphasis
    markdown = markdown.replace(/<ins[^>]*>([\s\S]*?)<\/ins>/gi, (match, content) => {
      const processed = convertHtmlToMarkdown(content).trim();
      return processed ? `_${processed}_` : '';
    });

    // Convert small text (keep as-is, no markdown equivalent)
    markdown = markdown.replace(/<small[^>]*>([\s\S]*?)<\/small>/gi, (match, content) => {
      return convertHtmlToMarkdown(content);
    });

    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, content) => {
      const text = convertHtmlToMarkdown(content.trim());
      return text ? `\n\n${text}\n\n` : '';
    });

    // Convert line breaks
    markdown = markdown.replace(/<br[^>]*\/?>/gi, '  \n');

    // Convert divs and spans (treat as inline/block elements)
    markdown = markdown.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (match, content) => {
      const text = convertHtmlToMarkdown(content.trim());
      return text ? `\n\n${text}\n\n` : '';
    });

    markdown = markdown.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, (match, content) => {
      return convertHtmlToMarkdown(content);
    });

    // Convert address, article, section, aside, header, footer, main, nav (semantic blocks)
    const blockElements = ['address', 'article', 'section', 'aside', 'header', 'footer', 'main', 'nav'];
    for (const elem of blockElements) {
      const regex = new RegExp(`<${elem}[^>]*>([\\s\\S]*?)<\\/${elem}>`, 'gi');
      markdown = markdown.replace(regex, (match, content) => {
        const text = convertHtmlToMarkdown(content.trim());
        return text ? `\n\n${text}\n\n` : '';
      });
    }

    // Remove any remaining HTML tags (only match valid-looking tags, not things like <3)
    // Valid HTML tags start with a letter or /, not a number or symbol
    markdown = markdown.replace(/<\/?[a-zA-Z][^>]*>/g, '');

    // Decode any remaining HTML entities
    markdown = decodeEntities(markdown);

    // Clean up whitespace
    markdown = markdown
      .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
      .replace(/[ \t]+$/gm, '')    // Remove trailing spaces/tabs
      .replace(/^[ \t]+/gm, (m) => m.replace(/\t/g, '  ')) // Convert tabs to spaces at line start
      .trim();

    return markdown;

  } catch {
    // Conversion failed - return original HTML unchanged
    return htmlContent;
  }
}
