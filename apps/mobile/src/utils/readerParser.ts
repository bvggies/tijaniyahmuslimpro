export type BlockType = 'heading' | 'paragraph' | 'quote' | 'list';

export interface ReaderBlock {
  id: string;
  type: BlockType;
  text: string;
  level?: 1 | 2 | 3;
  items?: string[];
}

export interface TOCItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

const HEADING_PATTERNS = [
  /^Proof of TASAWWUF PART 1$/i,
  /^DHIKR IS THE GREATEST OBLIGATION AND A PERPETUAL DIVINE ORDER$/i,
  /^Meanings of Dhikr$/i,
  /^Loudness in dhikr$/i,
  /^Gatherings of Collective, Loud Dhikr$/i,
];

const QUOTE_PATTERNS = [
  /^"[^"]+"\s*\(\d+:\d+\)/,
  /^"[^"]+"$/,
];

const LIST_ITEM_PATTERN = /^–\s+/;

export function parseReaderContent(raw: string): {
  blocks: ReaderBlock[];
  toc: TOCItem[];
} {
  const lines = raw.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  const blocks: ReaderBlock[] = [];
  const toc: TOCItem[] = [];
  let blockId = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

    // Check for heading
    let isHeading = false;
    let headingLevel: 1 | 2 | 3 = 1;

    for (const pattern of HEADING_PATTERNS) {
      if (pattern.test(line)) {
        isHeading = true;
        // Determine level based on content
        if (line.includes('PART 1') || line.includes('GREATEST OBLIGATION')) {
          headingLevel = 1;
        } else if (line.includes('Meanings') || line.includes('Loudness') || line.includes('Gatherings')) {
          headingLevel = 2;
        } else {
          headingLevel = 3;
        }
        break;
      }
    }

    if (isHeading) {
      const id = `heading-${blockId++}`;
      blocks.push({
        id,
        type: 'heading',
        text: line,
        level: headingLevel,
      });
      toc.push({
        id,
        text: line,
        level: headingLevel,
      });
      i++;
      continue;
    }

    // Check for list
    if (LIST_ITEM_PATTERN.test(line)) {
      const items: string[] = [];
      while (i < lines.length && LIST_ITEM_PATTERN.test(lines[i])) {
        items.push(lines[i].replace(LIST_ITEM_PATTERN, ''));
        i++;
      }
      blocks.push({
        id: `list-${blockId++}`,
        type: 'list',
        text: items.join('\n'),
        items,
      });
      continue;
    }

    // Check for quote (Quran verse or hadith)
    let isQuote = false;
    for (const pattern of QUOTE_PATTERNS) {
      if (pattern.test(line)) {
        isQuote = true;
        break;
      }
    }

    // Also check if line starts with quote-like content
    if (!isQuote && (line.startsWith('"') || line.match(/^\d+:\d+/))) {
      isQuote = true;
    }

    // Collect paragraph (may span multiple lines)
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const currentLine = lines[i];
      
      // Stop if we hit a heading, list item, or empty line
      if (currentLine.length === 0) {
        i++;
        break;
      }

      let shouldStop = false;
      for (const pattern of HEADING_PATTERNS) {
        if (pattern.test(currentLine)) {
          shouldStop = true;
          break;
        }
      }

      if (shouldStop || LIST_ITEM_PATTERN.test(currentLine)) {
        break;
      }

      // Check if it's a quote continuation
      if (isQuote || currentLine.startsWith('"') || currentLine.match(/^\d+:\d+/)) {
        paragraphLines.push(currentLine);
        i++;
        // Continue quote until we hit a non-quote line
        if (i < lines.length && !lines[i].startsWith('"') && !lines[i].match(/^\d+:\d+/)) {
          // Check if next line is still part of quote (might be continuation)
          if (lines[i].length > 0 && !HEADING_PATTERNS.some((p) => p.test(lines[i]))) {
            // Might be continuation, check context
            const nextIsQuote = lines[i].startsWith('"') || lines[i].match(/^\d+:\d+/);
            if (!nextIsQuote) {
              break;
            }
          } else {
            break;
          }
        }
      } else {
        paragraphLines.push(currentLine);
        i++;
        // Stop if next line looks like a heading or list
        if (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.length === 0) {
            i++;
            break;
          }
          if (HEADING_PATTERNS.some((p) => p.test(nextLine)) || LIST_ITEM_PATTERN.test(nextLine)) {
            break;
          }
        }
      }
    }

    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(' ');
      blocks.push({
        id: `${isQuote ? 'quote' : 'paragraph'}-${blockId++}`,
        type: isQuote ? 'quote' : 'paragraph',
        text,
      });
    }
  }

  return { blocks, toc };
}

