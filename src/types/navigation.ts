export interface MarkdownFileEntry {
  path: string;
  name: string;
  directory: string;
  sha: string;
  size?: number;
}

export interface SearchMatchResult {
  file: MarkdownFileEntry;
  matchType: 'filename' | 'content' | 'both';
  snippet?: string;
}
