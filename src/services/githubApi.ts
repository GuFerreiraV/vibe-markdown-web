import { GitHubTreeResponse, MarkdownFileEntry, RepositoryTarget } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem('github_token');
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token && token.trim().length > 0) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

export async function fetchRepositoryTree(target: RepositoryTarget): Promise<{
  files: MarkdownFileEntry[];
  branch: string;
}> {
  const branchesToTry = [target.branch, 'main', 'master'].filter(
    (val, idx, self) => Boolean(val) && self.indexOf(val) === idx
  );

  let lastError: Error | null = null;
  const safeOwner = encodeURIComponent(target.owner.trim());
  const safeRepo = encodeURIComponent(target.repo.trim());

  for (const branch of branchesToTry) {
    try {
      const safeBranch = encodeURIComponent(branch.trim());
      const url = `${GITHUB_API_BASE}/repos/${safeOwner}/${safeRepo}/git/trees/${safeBranch}?recursive=1`;
      const response = await fetch(url, { headers: getAuthHeaders() });

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        if (rateLimitRemaining === '0') {
          throw new Error('Limite de requisições da GitHub API atingido (60 req/h). Configure um Personal Access Token (PAT) nas opções ou aguarde a renovação.');
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          lastError = new Error(`Repositório ou branch '${branch}' não encontrado.`);
          continue;
        }
        throw new Error(`Erro na API do GitHub (${response.status}): ${response.statusText}`);
      }

      const data: GitHubTreeResponse = await response.json();
      
      const markdownFiles: MarkdownFileEntry[] = data.tree
        .filter((item) => item.type === 'blob' && item.path.toLowerCase().endsWith('.md'))
        .map((item) => {
          const parts = item.path.split('/');
          const name = parts[parts.length - 1];
          const directory = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
          return {
            path: item.path,
            name,
            directory,
            sha: item.sha,
            size: item.size,
          };
        });

      return {
        files: markdownFiles,
        branch,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error(`Não foi possível carregar o repositório ${target.owner}/${target.repo}`);
}

export async function fetchRawMarkdownContent(
  target: RepositoryTarget,
  filePath: string
): Promise<string> {
  const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const encodedPath = normalizedPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const safeOwner = encodeURIComponent(target.owner.trim());
  const safeRepo = encodeURIComponent(target.repo.trim());
  const safeBranch = encodeURIComponent(target.branch.trim());

  const url = `${GITHUB_RAW_BASE}/${safeOwner}/${safeRepo}/${safeBranch}/${encodedPath}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Arquivo '${filePath}' não encontrado no repositório.`);
    }
    throw new Error(`Falha ao baixar arquivo bruto (${response.status}): ${response.statusText}`);
  }

  return await response.text();
}
