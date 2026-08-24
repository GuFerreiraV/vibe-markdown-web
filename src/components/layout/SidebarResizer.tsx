import React from 'react';

interface SidebarResizerProps {
  onPointerDown: (e: React.PointerEvent) => void;
  isResizing: boolean;
}

export const SidebarResizer: React.FC<SidebarResizerProps> = ({ onPointerDown, isResizing }) => {
  return (
    <div
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="vertical"
      title="Arraste para redimensionar a barra lateral"
      className={`w-1.5 hover:w-2 hover:bg-sky-500/80 active:bg-sky-500 cursor-col-resize flex-shrink-0 transition-all select-none relative group ${
        isResizing ? 'bg-sky-500 w-2' : 'bg-neutral-800'
      }`}
    >
      <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
      <div className="h-full flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-0.5 h-6 bg-neutral-400 rounded-full" />
      </div>
    </div>
  );
};
