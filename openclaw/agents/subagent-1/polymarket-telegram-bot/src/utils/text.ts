export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export function normalizeText(input: string): string {
  return normalizeWhitespace(input.toLowerCase());
}

export function tokenize(input: string): string[] {
  return normalizeText(input).split(/[^a-z0-9$.%]+/).filter(Boolean);
}

export function removeMatched(input: string, patterns: RegExp[]): string {
  let output = input;
  for (const pattern of patterns) {
    output = output.replace(pattern, ' ');
  }
  return normalizeWhitespace(output);
}
