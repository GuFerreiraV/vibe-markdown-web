import React, { useState } from 'react';
import { Highlighter, Eraser, Copy, Check, ExternalLink, FileText } from 'lucide-react';
import { RepositoryTarget } from '../../types/github';

interface TextHighlighterToolbarProps {
  filePath: string | null;
  target: RepositoryTarget;
  rawContent: string;
  isHighlightActive: boolean;
  onToggleHighlight: () => void;
  onClearHighlights: () => void;
}

export const TextHighlighterToolbar: React.FC<TextHighlighterToolbarProps> = ({
  filePath,
  target,
  rawContent,
  isHighlightActive,
  onToggleHighlight,
  onClearHighlights,
}) => {
  const [copied, setCopied] = useState(false);

  if (!filePath) return null;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileGithubUrl = `https://github.com/${target.owner}/${target.repo}/blob/${target.branch}/${filePath}`;

  return (
    <div className="h-10 px-4 bg-neutral-900/90 backdrop-blur border-b border-neutral-800 flex items-center justify-between select-none flex-shrink-0 z-10 sticky top-0">
      <div className="flex items-center space-x-2 text-xs text-neutral-400 truncate max-w-[50%]">
        <FileText size={14} className="text-sky-400 flex-shrink-0" />
        <span className="font-mono text-neutral-200 truncate" title={filePath}>
          {filePath}
        </span>
      </div>

      <div className="flex items-center space-x-1.5 text-xs">
        <button
          onClick={onToggleHighlight}
          title={
            isHighlightActive
              ? 'Desativar marca-texto (amarelo)'
              : 'Ativar marca-texto: selecione o texto com o mouse para destacar em amarelo'
          }
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all border ${
            isHighlightActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30 font-medium'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border-neutral-700/50'
          }`}
        >
          <Highlighter size={13} className={isHighlightActive ? 'text-amber-400' : ''} />
          <span>Marca-texto</span>
        </button>

        <button
          onClick={onClearHighlights}
          title="Limpar todas as marcações de texto neste documento"
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700/50"
        >
          <Eraser size={14} />
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        <button
          onClick={handleCopyRaw}
          title="Copiar Markdown bruto"
          className="flex items-center space-x-1 px-2 py-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="text-[11px]">Copiar .md</span>
            </>
          )}
        </button>

        <a
          href={fileGithubUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver no GitHub"
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
