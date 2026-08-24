/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_GITHUB_OWNER?: string;
  readonly VITE_DEFAULT_GITHUB_REPO?: string;
  readonly VITE_DEFAULT_GITHUB_BRANCH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
