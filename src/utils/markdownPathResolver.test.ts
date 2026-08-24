import { describe, it, expect } from 'vitest';
import {
  resolveRelativePath,
  resolveGitHubImageUrl,
  isInternalMarkdownLink,
  isSafeUrl,
  isSafeImageUrl,
} from './markdownPathResolver';
import { RepositoryTarget } from '../types/github';

describe('markdownPathResolver', () => {
  const target: RepositoryTarget = {
    owner: 'facebook',
    repo: 'react',
    branch: 'main',
  };

  describe('isSafeUrl', () => {
    it('permite protocolos seguros e caminhos relativos', () => {
      expect(isSafeUrl('https://github.com')).toBe(true);
      expect(isSafeUrl('http://example.com')).toBe(true);
      expect(isSafeUrl('mailto:suporte@teste.com')).toBe(true);
      expect(isSafeUrl('#secao-1')).toBe(true);
      expect(isSafeUrl('./docs/intro.md')).toBe(true);
      expect(isSafeUrl('../outro.md')).toBe(true);
    });

    it('bloqueia protocolos perigosos de XSS', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:alert(document.cookie)')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('')).toBe(false);
      expect(isSafeUrl(undefined)).toBe(false);
    });
  });

  describe('isSafeImageUrl', () => {
    it('permite URLs https/http e caminhos relativos de imagens', () => {
      expect(isSafeImageUrl('https://site.com/foto.png')).toBe(true);
      expect(isSafeImageUrl('./assets/diagram.png')).toBe(true);
      expect(isSafeImageUrl('../img/banner.jpg')).toBe(true);
    });

    it('permite data URIs rasterizados seguros em base64', () => {
      expect(isSafeImageUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=')).toBe(true);
      expect(isSafeImageUrl('data:image/jpeg;base64,/9j/4AAQSkZJRg==')).toBe(true);
    });

    it('bloqueia protocolos perigosos ou data URIs de scripts', () => {
      expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeImageUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(false);
    });
  });

  describe('resolveRelativePath', () => {
    it('mantém URLs absolutas inalteradas', () => {
      expect(resolveRelativePath('docs', 'https://example.com/image.png')).toBe(
        'https://example.com/image.png'
      );
    });

    it('resolve caminhos no mesmo diretório', () => {
      expect(resolveRelativePath('docs/guide', './intro.png')).toBe('docs/guide/intro.png');
    });

    it('resolve caminhos no diretório pai', () => {
      expect(resolveRelativePath('docs/guide', '../images/logo.png')).toBe(
        'docs/images/logo.png'
      );
    });

    it('resolve a partir da raiz', () => {
      expect(resolveRelativePath('', './assets/banner.png')).toBe('assets/banner.png');
    });
  });

  describe('resolveGitHubImageUrl', () => {
    it('gera URL correta da CDN do GitHub Raw para imagens relativas', () => {
      const url = resolveGitHubImageUrl(target, 'docs', './img/diagram.png');
      expect(url).toBe(
        'https://raw.githubusercontent.com/facebook/react/main/docs/img/diagram.png'
      );
    });

    it('preserva URLs completas externas seguras', () => {
      const url = resolveGitHubImageUrl(
        target,
        'docs',
        'https://site.com/externa.jpg'
      );
      expect(url).toBe('https://site.com/externa.jpg');
    });

    it('rejeita imagens com URLs perigosas', () => {
      const url = resolveGitHubImageUrl(target, 'docs', 'javascript:alert(1)');
      expect(url).toBe('');
    });
  });

  describe('isInternalMarkdownLink', () => {
    it('identifica links .md internos', () => {
      expect(isInternalMarkdownLink('./setup.md')).toBe(true);
      expect(isInternalMarkdownLink('../api/guide.md#section')).toBe(true);
    });

    it('rejeita links externos, âncoras puras ou URLs perigosas', () => {
      expect(isInternalMarkdownLink('https://github.com/react.md')).toBe(false);
      expect(isInternalMarkdownLink('#secao')).toBe(false);
      expect(isInternalMarkdownLink('arquivo.png')).toBe(false);
      expect(isInternalMarkdownLink('javascript:alert(1).md')).toBe(false);
    });
  });
});
