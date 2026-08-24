import { useState, useEffect, useMemo } from 'react';
import { MarkdownFileEntry, RepositoryTarget } from '../types/github';
import { SearchMatchResult } from '../types/navigation';
import { getAllCachedFilesForRepo } from '../services/indexedDbCache';

export function useMarkdownSearch(
  files: MarkdownFileEntry[],
  target: RepositoryTarget,
  query: string
) {
  const [cachedContents, setCachedContents] = useState<Map<string, string>>(new Map());

  // Carrega arquivos já cacheados no IndexedDB para busca em conteúdo
  useEffect(() => {
    let isMounted = true;
    getAllCachedFilesForRepo(target.owner, target.repo).then((cachedList) => {
      if (isMounted) {
        const map = new Map<string, string>();
        for (const item of cachedList) {
          map.set(item.path, item.content);
        }
        setCachedContents(map);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [target.owner, target.repo, files]);

  const searchResults = useMemo<SearchMatchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return files.map((f) => ({
        file: f,
        matchType: 'filename' as const,
      }));
    }

    const results: SearchMatchResult[] = [];

    for (const file of files) {
      const fileNameLower = file.name.toLowerCase();
      const filePathLower = file.path.toLowerCase();
      const nameMatched = fileNameLower.includes(trimmed) || filePathLower.includes(trimmed);

      const content = cachedContents.get(file.path) || '';
      const contentLower = content.toLowerCase();
      const contentIndex = contentLower.indexOf(trimmed);
      const contentMatched = contentIndex !== -1;

      if (nameMatched || contentMatched) {
        let snippet: string | undefined;
        if (contentMatched) {
          const start = Math.max(0, contentIndex - 30);
          const end = Math.min(content.length, contentIndex + trimmed.length + 50);
          snippet = (start > 0 ? '...' : '') + content.slice(start, end).replace(/\n/g, ' ') + (end < content.length ? '...' : '');
        }

        results.push({
          file,
          matchType: nameMatched && contentMatched ? 'both' : nameMatched ? 'filename' : 'content',
          snippet,
        });
      }
    }

    return results;
  }, [files, query, cachedContents]);

  return {
    searchResults,
    totalCount: files.length,
    matchedCount: searchResults.length,
  };
}
