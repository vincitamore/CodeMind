/**
 * Mention Parser - Extract @mentions from user input
 */

export interface Mention {
  type: 'file' | 'directory';
  path: string;
  displayName: string;
  range: { start: number; end: number };
}

/**
 * Extract @mentions from text
 * Supports: @file.ts, @folder/file.ts, @"path with spaces.txt"
 */
export function extractMentions(text: string): Mention[] {
  const mentions: Mention[] = [];
  
  // Pattern: @path or @"path with spaces"
  const mentionPattern = /@(?:"([^"]+)"|(\S+))/g;
  
  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    const path = match[1] || match[2]; // Quoted or unquoted
    const start = match.index;
    const end = start + match[0].length;
    
    // Determine if it's a directory (ends with /) or file
    const isDirectory = path.endsWith('/');
    const displayName = path.split('/').pop() || path;
    
    mentions.push({
      type: isDirectory ? 'directory' : 'file',
      path: path,
      displayName: displayName,
      range: { start, end }
    });
  }
  
  return mentions;
}

/**
 * Remove @mentions from text (for sending to LLM)
 */
export function stripMentions(text: string): string {
  return text.replace(/@(?:"[^"]+?"|\S+)/g, '').trim();
}

/**
 * Get autocomplete suggestions for partial @mention
 * @param partial The text after @ (e.g., "impl" for @impl)
 * @param availableFiles List of available file paths
 */
export function getAutocompleteSuggestions(
  partial: string,
  availableFiles: string[]
): string[] {
  const lowerPartial = partial.toLowerCase();
  
  return availableFiles
    .filter(file => {
      const fileName = file.split('/').pop()?.toLowerCase() || '';
      const filePath = file.toLowerCase();
      return fileName.includes(lowerPartial) || filePath.includes(lowerPartial);
    })
    .sort((a, b) => {
      // Prioritize exact matches at start of filename
      const aName = a.split('/').pop()?.toLowerCase() || '';
      const bName = b.split('/').pop()?.toLowerCase() || '';
      const aStarts = aName.startsWith(lowerPartial);
      const bStarts = bName.startsWith(lowerPartial);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Then by length (shorter = more relevant)
      return a.length - b.length;
    })
    .slice(0, 10); // Top 10 suggestions
}

/**
 * Replace mention text with formatted version
 */
export function formatMention(mention: Mention): string {
  const needsQuotes = mention.path.includes(' ');
  return needsQuotes ? `@"${mention.path}"` : `@${mention.path}`;
}

