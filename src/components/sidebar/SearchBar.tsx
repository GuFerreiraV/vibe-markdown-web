import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  matchedCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  matchedCount,
  totalCount,
}) => {
  return (
    <div className="p-3 border-b border-neutral-800 flex-shrink-0">
      <div className="relative flex items-center">
        <Search size={15} className="absolute left-2.5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome ou conteúdo..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-neutral-950 border border-neutral-700/80 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            title="Limpar busca"
            className="absolute right-2 text-neutral-400 hover:text-neutral-200 p-0.5"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {value && (
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400 px-0.5">
          <span>Resultados:</span>
          <span className="font-mono text-sky-400">
            {matchedCount} de {totalCount}
          </span>
        </div>
      )}
    </div>
  );
};
