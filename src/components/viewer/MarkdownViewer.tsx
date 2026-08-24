import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { RepositoryTarget } from '../../types/github';
import { useTextHighlight } from '../../hooks/useTextHighlight';
import { TextHighlighterToolbar } from './TextHighlighterToolbar';
import { CodeBlock } from './CodeBlock';
import {
  resolveGitHubImageUrl,
  resolveRelativePath,
  isInternalMarkdownLink,
  isSafeUrl,
  isSafeImageUrl,
} from '../../utils/markdownPathResolver';
import { FileQuestion, AlertCircle } from 'lucide-react';

interface MarkdownViewerProps {
  filePath: string | null;
  content: string;
  target: RepositoryTarget;
  isLoading: boolean;
  error: string | null;
  onSelectFile: (path: string) => void;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  filePath,
  content,
  target,
  isLoading,
  error,
  onSelectFile,
}) => {
  const {
    isHighlightActive,
    toggleHighlightMode,
    containerRef,
    handleMouseUp,
    clearHighlights,
  } = useTextHighlight();

  // Diretório do arquivo atual para resolução de caminhos relativos
  const currentDirectory = useMemo(() => {
    if (!filePath) return '';
    const parts = filePath.split('/');
    return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
  }, [filePath]);

  // Componentes customizados para o renderizador ReactMarkdown
  const customComponents = useMemo(() => {
    return {
      // Resolução segura de imagens relativas para GitHub Raw CDN
      img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
        if (!src || !isSafeImageUrl(src)) return null;
        const resolvedSrc = resolveGitHubImageUrl(target, currentDirectory, src);
        if (!resolvedSrc) return null;

        return (
          <img
            src={resolvedSrc}
            alt={alt || ''}
            loading="lazy"
            className="rounded-lg max-w-full my-4 border border-neutral-800 shadow-md"
            {...props}
          />
        );
      },
      // Resolução segura de links (Sumário, arquivos .md internos e externos com sanitização de protocolos)
      a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        if (!href || !isSafeUrl(href)) {
          return <span className="text-neutral-400 underline underline-offset-2">{children}</span>;
        }

        if (href.startsWith('#')) {
          const anchorId = href.slice(1);
          return (
            <a
              href={href}
              onClick={(e) => {
                e.preventDefault();
                const decodedId = decodeURIComponent(anchorId).toLowerCase();
                const targetElement =
                  document.getElementById(anchorId) ||
                  document.getElementById(decodedId) ||
                  (containerRef.current ? containerRef.current.querySelector(`[id="${CSS.escape(anchorId)}"]`) : null) ||
                  (containerRef.current ? containerRef.current.querySelector(`[id="${CSS.escape(decodedId)}"]`) : null);

                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
              title={`Ir para ${anchorId}`}
              {...props}
            >
              {children}
            </a>
          );
        }

        if (isInternalMarkdownLink(href)) {
          const resolvedPath = resolveRelativePath(currentDirectory, href);
          return (
            <a
              href={`#${resolvedPath}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectFile(resolvedPath);
              }}
              className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
              title={`Navegar para ${resolvedPath}`}
              {...props}
            >
              {children}
            </a>
          );
        }

        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
            {...props}
          >
            {children}
          </a>
        );
      },
      // Cabeçalhos com margem de rolagem para não cobrir sob a barra de ferramentas
      h1: ({ children, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 id={id} className="scroll-mt-14 text-2xl font-bold text-white mb-4 mt-6" {...props}>
          {children}
        </h1>
      ),
      h2: ({ children, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 id={id} className="scroll-mt-14 text-xl font-bold text-white mb-3 mt-6 pb-1 border-b border-neutral-800" {...props}>
          {children}
        </h2>
      ),
      h3: ({ children, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 id={id} className="scroll-mt-14 text-lg font-semibold text-white mb-2 mt-5" {...props}>
          {children}
        </h3>
      ),
      h4: ({ children, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4 id={id} className="scroll-mt-14 text-base font-semibold text-white mb-2 mt-4" {...props}>
          {children}
        </h4>
      ),
      // Renderização de código com realce de sintaxe
      code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
        const isInline = !className && typeof children === 'string' && !children.includes('\n');
        if (isInline) {
          return (
            <code
              className="bg-neutral-800 text-sky-300 px-1.5 py-0.5 rounded text-[13px] font-mono"
              {...props}
            >
              {children}
            </code>
          );
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
      },
      // Tabelas estilizadas
      table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div className="overflow-x-auto my-6 border border-neutral-800 rounded-lg">
          <table className="min-w-full divide-y divide-neutral-800 text-left text-xs" {...props}>
            {children}
          </table>
        </div>
      ),
      th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
        <th className="px-3 py-2 bg-neutral-900 font-semibold text-white" {...props}>
          {children}
        </th>
      ),
      td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
        <td className="px-3 py-2 border-t border-neutral-800/60 text-neutral-100" {...props}>
          {children}
        </td>
      ),
    };
  }, [target, currentDirectory, onSelectFile, containerRef]);

  if (error) {
    return (
      <main className="flex-1 h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 max-w-md space-y-2">
          <AlertCircle size={28} className="text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-red-200">Erro ao carregar documento</h3>
          <p className="text-xs text-red-300/80">{error}</p>
        </div>
      </main>
    );
  }

  if (!filePath) {
    return (
      <main className="flex-1 h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center text-neutral-500 space-y-3">
        <FileQuestion size={36} className="text-neutral-600" />
        <h3 className="text-sm font-medium text-neutral-400">Nenhum arquivo selecionado</h3>
        <p className="text-xs text-neutral-600 max-w-xs">
          Selecione um arquivo Markdown na barra lateral para iniciar a leitura formatada.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full bg-neutral-950 flex flex-col min-w-0 overflow-hidden">
      <TextHighlighterToolbar
        filePath={filePath}
        target={target}
        rawContent={content}
        isHighlightActive={isHighlightActive}
        onToggleHighlight={toggleHighlightMode}
        onClearHighlights={clearHighlights}
      />

      <div
        className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10"
        onMouseUp={handleMouseUp}
      >
        <div
          ref={containerRef}
          key={filePath} // Força reconstrução do container ao trocar de arquivo (reseta marcações efêmeras)
          className={`max-w-4xl mx-auto text-neutral-100 prose prose-invert prose-headings:text-white prose-p:text-neutral-100 prose-li:text-neutral-100 prose-strong:text-white prose-em:text-neutral-100 prose-blockquote:text-neutral-200 prose-blockquote:border-sky-500 prose-a:text-sky-400 prose-code:text-sky-300 prose-pre:p-0 prose-pre:bg-transparent ${
            isHighlightActive ? 'cursor-text selection:bg-amber-400/40' : ''
          }`}
        >
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-neutral-800 rounded w-2/3" />
              <div className="h-4 bg-neutral-800/80 rounded w-full" />
              <div className="h-4 bg-neutral-800/80 rounded w-5/6" />
              <div className="h-32 bg-neutral-800/50 rounded w-full mt-6" />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeHighlight]}
              components={customComponents}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </main>
  );
};
