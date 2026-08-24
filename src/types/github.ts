export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface RepositoryTarget {
  owner: string;
  repo: string;
  branch: string;
}

export interface MarkdownFileEntry {
  path: string;
  name: string;
  directory: string;
  sha: string;
  size?: number;
}

export interface CachedMarkdownFile {
  key: string; // "owner/repo/path"
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
  content: string;
  cachedAt: number;
}
