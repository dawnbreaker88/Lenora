export interface Chunk {
  content: string;
  chunkIndex: number;
  metadata: {
    tokenCount: number;
  };
}

/**
 * Splits input text into overlapping chunks with word boundary preservation.
 */
export function chunkText(text: string, size = 3200, overlap = 400): Chunk[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks: Chunk[] = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);

    if (end < clean.length) {
      const boundary = clean.lastIndexOf(" ", end);
      if (boundary > start + size / 2) {
        end = boundary;
      }
    }

    const content = clean.slice(start, end).trim();
    if (content) {
      chunks.push({
        content,
        chunkIndex: chunks.length,
        metadata: {
          tokenCount: Math.ceil(content.length / 4),
        },
      });
    }

    if (end === clean.length) break;
    start = end - overlap;
  }

  return chunks;
}
