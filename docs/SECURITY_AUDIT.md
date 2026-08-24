# Relatório de Auditoria de Segurança: Markdown Web Viewer

**Data da Auditoria**: 2026-08-24  
**Escopo**: Análise de vulnerabilidades no código TypeScript/React, dependências npm, renderização de Markdown e integrações de rede.

---

## 1. Resumo Executivo

A auditoria de segurança identificou e remediou 4 pontos de atenção e vulnerabilidades potenciais relacionadas a injeção de scripts (XSS), manipulação de parâmetros de URL e dependências de terceiros. Todas as vulnerabilidades identificadas foram corrigidas e validadas por meio de testes automatizados e compilação em modo estrito.

| ID | Severidade | Vulnerabilidade / Risco | Status |
|---|---|---|---|
| SEC-01 | 🔴 **Crítico** | Potencial execução de scripts via links maliciosos (`javascript:`, `vbscript:`, `data:text/html`) no Markdown. | **Corrigido e Testado** |
| SEC-02 | 🟡 **Importante** | Falta de sanitização/codificação (`encodeURIComponent`) em parâmetros dinâmicos de URL na GitHub API. | **Corrigido e Testado** |
| SEC-03 | 🟡 **Importante** | Injeção de Data URIs maliciosos em imagens (`data:image/svg+xml` com scripts embutidos). | **Corrigido e Testado** |
| SEC-04 | 🟢 **Menor** | Folha de estilo CSS externa carregada via CDN sem Subresource Integrity (SRI). | **Corrigido (Local Bundling)** |
| SEC-05 | 💡 **Melhoria** | Ausência de Content Security Policy (CSP) para mitigação em profundidade. | **Implementado** |

---

## 2. Detalhamento dos Erros Encontrados e Correções Aplicadas

### SEC-01: Injeção de Protocolos Inseguros em Links Markdown (XSS)
* **Descrição do Erro**: O componente [`MarkdownViewer.tsx`](file:///home/ferreira/Projetos/markdown-web/src/components/viewer/MarkdownViewer.tsx) repassava diretamente a propriedade `href` para a tag `<a>`. Caso um repositório consumido contivesse links formatados como `[Clique aqui](javascript:alert(document.domain))`, o script poderia ser executado no contexto do cliente ao ser clicado, expondo dados de sessão como o `sessionStorage` (onde o Personal Access Token opcional é mantido).
* **Ação Corretiva**: 
  * Criada a função `isSafeUrl()` em [`src/utils/markdownPathResolver.ts`](file:///home/ferreira/Projetos/markdown-web/src/utils/markdownPathResolver.ts), rejeitando explicitamente esquemas `javascript:`, `vbscript:` e `data:text/html`.
  * Atualizado o componente de renderização de links em `MarkdownViewer.tsx` para neutralizar links inseguros, exibindo-os como texto inerte caso não atendam à política de segurança.

### SEC-02: Parâmetros de URL Não Codificados na GitHub API
* **Descrição do Erro**: Em [`src/services/githubApi.ts`](file:///home/ferreira/Projetos/markdown-web/src/services/githubApi.ts), as variáveis `target.owner`, `target.repo` e `branch` eram interpoladas diretamente na URL de requisição sem `encodeURIComponent`. Nomes de branch com caracteres especiais (`#`, `?`, `/`, espaços) podiam desestabilizar a requisição ou causar desvios de rota na API.
* **Ação Corretiva**: 
  * Aplicada a codificação `encodeURIComponent` em todos os parâmetros variáveis antes da concatenação das URLs da API REST e do CDN Raw do GitHub.

### SEC-03: Aceitação Irrestrita de Data URIs em Imagens
* **Descrição do Erro**: A resolução de imagens aceitava qualquer string iniciada por `data:`. Imagens formatadas como `data:image/svg+xml` podiam carregar código executável caso manipuladas diretamente.
* **Ação Corretiva**: 
  * Implementada a função `isSafeImageUrl()` com regex estrita permitindo apenas imagens rasterizadas em base64 (`image/png`, `image/jpeg`, `image/webp`, `image/gif`) e URLs `https://`/`http://` confiáveis.

### SEC-04: Recurso Externo Carregado sem SRI
* **Descrição do Erro**: O arquivo `index.html` incluía o CSS do highlight.js diretamente de `cdnjs.cloudflare.com` sem hashes de integridade (`integrity`) ou controle de versão pinado localmente.
* **Ação Corretiva**: 
  * O CSS `highlight.js/styles/github-dark.min.css` foi incorporado ao bundle da aplicação via `import` no [`src/main.tsx`](file:///home/ferreira/Projetos/markdown-web/src/main.tsx), eliminando a dependência de CDNs externas em tempo de execução.

### SEC-05: Defesa em Profundidade com Content Security Policy (CSP)
* **Descrição da Melhoria**: Não havia diretiva de Content Security Policy configurada no documento raiz.
* **Ação Corretiva**: 
  * Adicionada a tag `<meta http-equiv="Content-Security-Policy">` em [`index.html`](file:///home/ferreira/Projetos/markdown-web/index.html), restringindo conexões estritamente aos domínios da aplicação e da API/CDN do GitHub (`https://api.github.com`, `https://raw.githubusercontent.com`).

---

## 3. Resultados dos Testes de Segurança Pós-Correção

* **Auditoria de Dependências (`npm audit`)**: 0 vulnerabilidades detectadas.
* **Suíte de Testes Unitários (`npm test`)**: 15 testes aprovados com 100% de sucesso, cobrindo:
  * Rejeição de URLs com `javascript:`, `vbscript:` e `data:text/html`.
  * Validação de imagens seguras e rejeição de payloads perigosos.
  * Resolução correta e segura de caminhos relativos em múltiplos níveis de diretórios.
* **Compilação de Produção (`npm run build`)**: Concluída com sucesso sem erros de tipagem TypeScript.
