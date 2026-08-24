import { useState, useCallback, useRef } from 'react';
import { applyHighlightToSelection, clearHighlightsInContainer } from '../utils/domHighlight';

export function useTextHighlight() {
  const [isHighlightActive, setIsHighlightActive] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleHighlightMode = useCallback(() => {
    setIsHighlightActive((prev) => !prev);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isHighlightActive || !containerRef.current) {
      return;
    }
    applyHighlightToSelection(containerRef.current);
  }, [isHighlightActive]);

  const clearHighlights = useCallback(() => {
    if (containerRef.current) {
      clearHighlightsInContainer(containerRef.current);
    }
  }, []);

  return {
    isHighlightActive,
    toggleHighlightMode,
    containerRef,
    handleMouseUp,
    clearHighlights,
  };
}
