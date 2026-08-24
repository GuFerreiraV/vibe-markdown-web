# Markdown Web Viewer

> ⚠️ AVISO: Projeto 100% vibecodado, não houve nenhuma participação humana durante o desenvolvimento ⚠️.

Aplicação web SPA (Single Page Application) construída em React, TypeScript, Vite e Tailwind CSS para exploração, busca e visualização renderizada de arquivos Markdown (`.md`) hospedados em repositórios públicos do GitHub.

Projetada para execução 100% *client-side*, permitindo hospedagem contínua e gratuita em plataformas estáticas (GitHub Pages, Vercel ou Netlify), sem custos de infraestrutura ou necessidade de servidores intermediários.

---

## Recursos Principais

* **Navegação em Árvore de Arquivos**: Lista todos os arquivos `.md` encontrados no repositório através de uma única consulta à Git Trees API.
* **Barra Lateral Flexível**:
  * Alternância de visibilidade (ocultar / exibir com um clique).
  * Redimensionamento horizontal contínuo via manipulador de arrasto (220px a 600px).
  * Rolagem vertical dedicada para suportar centenas de arquivos.
  * Destaque visual contrastante e imediato no arquivo atualmente ativo.
* **Busca Híbrida e Inteligente**:
  * Filtragem instantânea por nome de arquivo e estrutura de diretórios.
  * Busca por palavras-chave dentro do conteúdo de arquivos previamente carregados em cache local.
* **Renderização Fiel de Markdown**:
  * Visualização limpa em modo preview (sem marcadores brutos como `##`, `>`, `-`).
  * Resolução automática de caminhos relativos de imagens (`.png`, `.jpg`, etc.) convertendo-os diretamente para URLs do CDN bruto do GitHub.
  * Navegação contínua ao clicar em links relativos para outros arquivos `.md`.
  * Realce de sintaxe em blocos de código com botão integrado para cópia.
* **Ferramenta de Marcação de Texto (Amarelo)**:
  * Realce visual ativado diretamente no visualizador através da Selection API.
  * Comportamento estritamente volátil em memória (reseta automaticamente ao trocar de arquivo).
* **Cache Local via IndexedDB**:
  * Armazenamento de arquivos visitados no navegador para navegação instantânea e redução drástica do consumo de cotas da GitHub API.

---

## Arquitetura e Estrutura

```
markdown-web/
├── .github/workflows/
│   └── deploy.yml          # Pipeline CI/CD para GitHub Pages
├── docs/
│   ├── SPRINT_LOG.md       # Registro histórico de sprints e tarefas
│   └── PROJECT_SPEC.md     # Especificação técnica detalhada
├── public/
│   └── favicon.svg         # Ícone da aplicação
├── src/
│   ├── components/
│   │   ├── layout/         # Header, AppLayout e SidebarResizer
│   │   ├── sidebar/        # Sidebar, SearchBar, FileTree e FileItem
│   │   └── viewer/         # MarkdownViewer, CodeBlock e TextHighlighterToolbar
│   ├── hooks/              # useGitHubRepo, useMarkdownSearch, useResizableSidebar, useTextHighlight
│   ├── services/           # githubApi (REST/Raw) e indexedDbCache (IndexedDB)
│   ├── types/              # Definições TypeScript
│   ├── utils/              # Resolução de paths e manipulação DOM de marcações
│   ├── App.tsx             # Composição da aplicação
│   ├── main.tsx            # Inicialização React
│   └── index.css           # Estilos globais e Tailwind CSS
├── .env.example            # Variáveis de configuração padrão
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Execução Local

### Pré-requisitos
* Node.js versão 18 ou superior.
* Gerenciador de pacotes npm.

### Instalação e Inicialização
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev
```

A aplicação estará acessível em `http://localhost:5173`.

### Executar Testes Automatizados
```bash
npm test
```

### Compilar para Produção
```bash
npm run build
```
Os arquivos otimizados para produção serão gerados no diretório `dist/`.

---

## Publicação e Hospedagem Gratuita

### GitHub Pages (Automático)
O projeto inclui o workflow `.github/workflows/deploy.yml`. Ao realizar o push para a branch `main`:
1. Acesse o repositório no GitHub -> **Settings** -> **Pages**.
2. Em **Build and deployment** / **Source**, selecione **GitHub Actions**.
3. A cada commit na branch `main`, a compilação e publicação ocorrerão de forma automática.

### Vercel / Netlify
1. Conecte o repositório GitHub à sua conta Vercel ou Netlify.
2. Defina o comando de build como `npm run build` e o diretório de saída como `dist`.
3. O deploy será concluído em segundos com certificado SSL gratuito.

---

## Documentações Adicionais
* [PROJECT_SPEC](docs/PROJECT_SPEC.md): Especificação técnica e decisões de engenharia.
