/**
 * Split a plain text field into paragraphs separated by one or more blank
 * lines. Leading/trailing whitespace and empty paragraphs are discarded.
 */
export function splitTextParagraphs(value: string): string[] {
  return value
    .split(/\r?\n\s*\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
