import React from 'react';
import { FileText, Folder } from 'lucide-react';
import { SearchMatchResult } from '../../types/navigation';

interface FileItemProps {
  result: SearchMatchResult;
  isSelected: boolean;
  onSelect: (path: string) => void;
}

export const FileItem: React.FC<FileItemProps> = ({ result, isSelected, onSelect }) => {
  const { file, matchType, snippet } = result;

  return (
    <button
      onClick={() => onSelect(file.path)}
      title={file.path}
      className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all flex flex-col space-y-0.5 group border ${
        isSelected
          ? 'bg-sky-500/20 text-sky-200 border-sky-500/50 shadow-sm font-medium'
          : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-neutral-100 border-transparent'
      }`}
    >
      <div className="flex items-center space-x-2 w-full min-w-0">
        <FileText
          size={14}
          className={`flex-shrink-0 transition-colors ${
            isSelected ? 'text-sky-400' : 'text-neutral-500 group-hover:text-neutral-400'
          }`}
        />
        <span className="truncate flex-1 font-mono">{file.name}</span>
        {matchType === 'content' && (
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans flex-shrink-0">
            conteúdo
          </span>
        )}
      </div>

      {file.directory && (
        <div className="flex items-center space-x-1 text-[11px] text-neutral-500 pl-5 truncate">
          <Folder size={11} className="flex-shrink-0" />
          <span className="truncate">{file.directory}</span>
        </div>
      )}

      {snippet && (
        <div className="text-[11px] text-neutral-400 pl-5 line-clamp-2 italic bg-neutral-950/40 p-1 rounded mt-1 border border-neutral-800/50 font-sans">
          "{snippet}"
        </div>
      )}
    </button>
  );
};
