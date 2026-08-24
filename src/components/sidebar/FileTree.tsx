import React from 'react';
import { SearchMatchResult } from '../../types/navigation';
import { FileItem } from './FileItem';
import { FileQuestion } from 'lucide-react';

interface FileTreeProps {
  results: SearchMatchResult[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  isLoading: boolean;
}

export const FileTree: React.FC<FileTreeProps> = ({
  results,
  selectedPath,
  onSelectFile,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-2 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-neutral-800/60 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center text-neutral-500 space-y-2">
        <FileQuestion size={28} className="text-neutral-600" />
        <p className="text-xs">Nenhum arquivo Markdown encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
      {results.map((res) => (
        <FileItem
          key={res.file.path}
          result={res}
          isSelected={selectedPath === res.file.path}
          onSelect={onSelectFile}
        />
      ))}
    </div>
  );
};
