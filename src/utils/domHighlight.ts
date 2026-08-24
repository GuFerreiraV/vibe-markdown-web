export function applyHighlightToSelection(container: HTMLElement, colorClass: string = 'bg-yellow-300/45 dark:bg-yellow-400/35'): boolean {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) {
    return false;
  }

  try {
    // If the selection spans within a single text node or simple container
    const selectedText = selection.toString().trim();
    if (!selectedText) {
      return false;
    }

    const mark = document.createElement('mark');
    mark.className = `${colorClass} text-inherit rounded-sm px-0.5 transition-colors`;
    mark.setAttribute('data-user-highlight', 'true');

    // Extract contents and wrap into mark
    const fragment = range.extractContents();
    mark.appendChild(fragment);
    range.insertNode(mark);

    selection.removeAllRanges();
    return true;
  } catch (err) {
    console.warn('Não foi possível aplicar o realce na seleção:', err);
    return false;
  }
}

export function clearHighlightsInContainer(container: HTMLElement): void {
  const marks = container.querySelectorAll('mark[data-user-highlight="true"]');
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    }
  });
}
