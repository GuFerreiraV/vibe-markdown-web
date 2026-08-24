/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { clearHighlightsInContainer } from './domHighlight';

describe('domHighlight', () => {
  it('remove todas as tags de marcação restaurando o texto original', () => {
    const container = document.createElement('div');
    container.innerHTML = '<p>Este é um <mark data-user-highlight="true">texto destacado</mark> para teste.</p>';

    expect(container.querySelectorAll('mark[data-user-highlight="true"]').length).toBe(1);

    clearHighlightsInContainer(container);

    expect(container.querySelectorAll('mark[data-user-highlight="true"]').length).toBe(0);
    expect(container.textContent).toBe('Este é um texto destacado para teste.');
  });
});
