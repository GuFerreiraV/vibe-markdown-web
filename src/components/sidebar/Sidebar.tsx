import React from 'react';
import { SearchMatchResult } from '../../types/navigation';
import { SearchBar } from './SearchBar';
import { FileTree } from './FileTree';
import { Files } from 'lucide-react';

interface SidebarProps {
  width: number;
  isOpen: boolean;
  searchResults: SearchMatchResult[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  totalCount: number;
  matchedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  isOpen,
  searchResults,
  selectedPath,
  onSelectFile,
  isLoading,
  searchQuery,
  onSearchChange,
  totalCount,
  matchedCount,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <aside
      style={{ width: `${width}px` }}
      className="h-full bg-neutral-900 border-r border-neutral-800 flex flex-col flex-shrink-0 select-none overflow-hidden"
    >
      <div className="h-10 px-3 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-medium">
        <div className="flex items-center space-x-1.5">
          <Files size={14} className="text-sky-400" />
          <span>Arquivos do Repositório</span>
        </div>
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
          {totalCount}
        </span>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        matchedCount={matchedCount}
        totalCount={totalCount}
      />

      <FileTree
        results={searchResults}
        selectedPath={selectedPath}
        onSelectFile={onSelectFile}
        isLoading={isLoading}
      />
    </aside>
  );
};
