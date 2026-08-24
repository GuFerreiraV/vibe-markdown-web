# Especificação Técnica do Projeto: Markdown Web Viewer

## 1. Visão Geral
O **Markdown Web Viewer** é uma aplicação web SPA (Single Page Application) construída em React, TypeScript, Vite e Tailwind CSS, projetada para visualização, busca e leitura renderizada de arquivos Markdown (`.md`) a partir de repositórios públicos do GitHub.

## 2. Stack Tecnológica
* **Linguagem**: TypeScript 5+ (modo estrito)
* **Framework Web**: React 18+
* **Build Tool**: Vite
* **Estilização**: Tailwind CSS com plugin `@tailwindcss/typography`
* **Renderização de Markdown**: `react-markdown`, `remark-gfm`, `rehype-highlight`
* **Armazenamento / Cache Local**: IndexedDB (API nativa / idb)
* **Testes**: Vitest + React Testing Library
* **Hospedagem Alvo**: GitHub Pages / Vercel / Netlify (Hospedagem estática 100% gratuita)

## 3. Arquitetura e Estrutura de Diretórios
```
markdown-web/
├── docs/
│   ├── SPRINT_LOG.md
│   └── PROJECT_SPEC.md
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   └── SidebarResizer.tsx
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FileTree.tsx
│   │   │   └── FileItem.tsx
│   │   └── viewer/
│   │       ├── MarkdownViewer.tsx
│   │       ├── CodeBlock.tsx
│   │       └── TextHighlighterToolbar.tsx
│   ├── hooks/
│   │   ├── useGitHubRepo.ts
│   │   ├── useMarkdownSearch.ts
│   │   ├── useResizableSidebar.ts
│   │   └── useTextHighlight.ts
│   ├── services/
│   │   ├── githubApi.ts
│   │   └── indexedDbCache.ts
│   ├── types/
│   │   ├── github.ts
│   │   ├── navigation.ts
│   │   └── highlight.ts
│   ├── utils/
│   │   ├── markdownPathResolver.ts
│   │   └── domHighlight.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 4. Funcionalidades Implementadas
1. **Barra Lateral**:
   * Listagem de todos os arquivos `.md` do repositório.
   * Alternância de visibilidade (ocultar/exibir).
   * Redimensionamento horizontal contínuo (220px a 600px).
   * Rolagem vertical dedicada para grandes volumes de arquivos.
   * Destaque visual contrastante no item selecionado.
2. **Mecanismo de Busca**:
   * Busca instantânea por nome do arquivo.
   * Busca por palavra-chave no conteúdo dos arquivos em cache local.
3. **Visualizador de Markdown**:
   * Renderização limpa sem tokens brutos.
   * Resolução de links relativos de imagens para GitHub Raw URLs.
   * Navegação interna contínua entre links de arquivos `.md`.
   * Realce de sintaxe em blocos de código com cópia rápida.
4. **Marcação de Texto Volátil**:
   * Ferramenta de realce em amarelo ativada via barra de ferramentas.
   * Operação estritamente em memória/DOM, descartada ao trocar de arquivo.

## 5. Instruções de Execução e Deploy
### 5.1. Execução Local
```bash
npm install
npm run dev
```

### 5.2. Build e Deploy Gratuito
```bash
npm run build
```
O diretório `dist/` gerado pode ser publicado diretamente no GitHub Pages via GitHub Actions ou importado na Vercel/Netlify sem custos.
