import React, { useState } from 'react';
import { RepositoryTarget } from '../../types/github';
import { FolderGit2, RefreshCw, KeyRound, ExternalLink, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface HeaderProps {
  target: RepositoryTarget;
  onChangeRepository: (newTarget: RepositoryTarget) => void;
  onRefresh: () => void;
  isLoading: boolean;
  fileCount: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  target,
  onChangeRepository,
  onRefresh,
  isLoading,
  fileCount,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownerInput, setOwnerInput] = useState(target.owner);
  const [repoInput, setRepoInput] = useState(target.repo);
  const [branchInput, setBranchInput] = useState(target.branch);
  const [tokenInput, setTokenInput] = useState(() => sessionStorage.getItem('github_token') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerInput.trim() || !repoInput.trim()) return;

    if (tokenInput.trim()) {
      sessionStorage.setItem('github_token', tokenInput.trim());
    } else {
      sessionStorage.removeItem('github_token');
    }

    onChangeRepository({
      owner: ownerInput.trim(),
      repo: repoInput.trim(),
      branch: branchInput.trim() || 'main',
    });
    setIsModalOpen(false);
  };

  const githubRepoUrl = `https://github.com/${target.owner}/${target.repo}`;

  return (
    <header className="h-14 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between select-none z-20 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Ocultar barra lateral' : 'Exibir barra lateral'}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-600"
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <FolderGit2 size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-neutral-200">
                {target.owner} / {target.repo}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                {target.branch}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {fileCount} {fileCount === 1 ? 'arquivo Markdown' : 'arquivos Markdown'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Recarregar repositório"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => {
            setOwnerInput(target.owner);
            setRepoInput(target.repo);
            setBranchInput(target.branch);
            setIsModalOpen(true);
          }}
          className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition-colors"
        >
          Trocar Repositório
        </button>

        <a
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir no GitHub"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-base font-semibold text-neutral-100 mb-4 flex items-center space-x-2">
              <FolderGit2 size={18} className="text-sky-400" />
              <span>Configurar Repositório GitHub</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Proprietário / Organização (Owner)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: facebook"
                  value={ownerInput}
                  onChange={(e) => setOwnerInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Nome do Repositório (Repo)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: react"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Branch Principal</label>
                <input
                  type="text"
                  placeholder="main ou master"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-neutral-400 mb-1 font-medium flex items-center space-x-1">
                  <KeyRound size={12} className="text-amber-400" />
                  <span>Personal Access Token (Opcional - Aumenta cota da API)</span>
                </label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-sky-500 font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Armazenado estritamente na memória da sua sessão local (sessionStorage).
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
                >
                  Carregar Repositório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
