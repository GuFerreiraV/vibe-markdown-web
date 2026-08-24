import { useState, useEffect, useCallback } from 'react';
import { MarkdownFileEntry, RepositoryTarget } from '../types/github';
import { fetchRepositoryTree, fetchRawMarkdownContent } from '../services/githubApi';
import { getCachedFile, saveCachedFile } from '../services/indexedDbCache';

const DEFAULT_OWNER = import.meta.env.VITE_DEFAULT_GITHUB_OWNER || 'facebook';
const DEFAULT_REPO = import.meta.env.VITE_DEFAULT_GITHUB_REPO || 'react';
const DEFAULT_BRANCH = import.meta.env.VITE_DEFAULT_GITHUB_BRANCH || 'main';

export function useGitHubRepo() {
  const [target, setTarget] = useState<RepositoryTarget>(() => {
    const savedOwner = localStorage.getItem('repo_owner') || DEFAULT_OWNER;
    const savedRepo = localStorage.getItem('repo_name') || DEFAULT_REPO;
    const savedBranch = localStorage.getItem('repo_branch') || DEFAULT_BRANCH;
    return { owner: savedOwner, repo: savedRepo, branch: savedBranch };
  });

  const [files, setFiles] = useState<MarkdownFileEntry[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [isTreeLoading, setIsTreeLoading] = useState<boolean>(false);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega a árvore de arquivos do repositório
  const loadRepositoryTree = useCallback(async (targetRepo: RepositoryTarget) => {
    setIsTreeLoading(true);
    setError(null);
    try {
      const { files: treeFiles, branch: resolvedBranch } = await fetchRepositoryTree(targetRepo);
      setFiles(treeFiles);
      if (resolvedBranch !== targetRepo.branch) {
        setTarget((prev) => ({ ...prev, branch: resolvedBranch }));
      }
      // Se não houver arquivo selecionado ou o atual não existir mais, seleciona o primeiro
      if (treeFiles.length > 0) {
        const stillExists = treeFiles.some((f) => f.path === selectedFilePath);
        if (!stillExists) {
          const readme = treeFiles.find((f) => f.name.toLowerCase() === 'readme.md') || treeFiles[0];
          setSelectedFilePath(readme.path);
        }
      } else {
        setSelectedFilePath(null);
        setCurrentContent('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar repositório.');
      setFiles([]);
      setSelectedFilePath(null);
      setCurrentContent('');
    } finally {
      setIsTreeLoading(false);
    }
  }, [selectedFilePath]);

  // Carrega o conteúdo do arquivo selecionado (com cache IndexedDB)
  const loadFileContent = useCallback(async (filePath: string) => {
    setIsFileLoading(true);
    setError(null);
    try {
      const fileEntry = files.find((f) => f.path === filePath);
      const sha = fileEntry?.sha || '';

      // Tenta recuperar do cache local
      const cached = await getCachedFile(target.owner, target.repo, filePath);
      if (cached && (cached.sha === sha || !sha)) {
        setCurrentContent(cached.content);
        setIsFileLoading(false);
        return;
      }

      // Baixa via GitHub Raw CDN
      const rawContent = await fetchRawMarkdownContent(target, filePath);
      setCurrentContent(rawContent);

      // Salva no IndexedDB
      await saveCachedFile({
        key: `${target.owner.toLowerCase()}/${target.repo.toLowerCase()}/${filePath}`,
        owner: target.owner,
        repo: target.repo,
        branch: target.branch,
        path: filePath,
        sha,
        content: rawContent,
        cachedAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar conteúdo do arquivo.');
      setCurrentContent('');
    } finally {
      setIsFileLoading(false);
    }
  }, [files, target]);

  // Efeito ao trocar de repositório
  useEffect(() => {
    loadRepositoryTree(target);
    localStorage.setItem('repo_owner', target.owner);
    localStorage.setItem('repo_name', target.repo);
    localStorage.setItem('repo_branch', target.branch);
  }, [target.owner, target.repo, target.branch]);

  // Efeito ao trocar de arquivo selecionado
  useEffect(() => {
    if (selectedFilePath) {
      loadFileContent(selectedFilePath);
    }
  }, [selectedFilePath, loadFileContent]);

  const changeRepository = useCallback((newTarget: RepositoryTarget) => {
    setSelectedFilePath(null);
    setTarget(newTarget);
  }, []);

  const selectFile = useCallback((path: string) => {
    setSelectedFilePath(path);
  }, []);

  return {
    target,
    files,
    selectedFilePath,
    currentContent,
    isTreeLoading,
    isFileLoading,
    error,
    changeRepository,
    selectFile,
    reloadTree: () => loadRepositoryTree(target),
  };
}
