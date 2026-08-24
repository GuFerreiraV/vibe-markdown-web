import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CachedMarkdownFile } from '../types/github';

interface MarkdownWebDB extends DBSchema {
  files_cache: {
    key: string; // "owner/repo/path"
    value: CachedMarkdownFile;
    indexes: {
      'by-repo': string; // "owner/repo"
    };
  };
}

const DB_NAME = 'markdown_web_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MarkdownWebDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MarkdownWebDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MarkdownWebDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('files_cache')) {
          const store = db.createObjectStore('files_cache', { keyPath: 'key' });
          store.createIndex('by-repo', ['owner', 'repo']);
        }
      },
    });
  }
  return dbPromise;
}

export function buildCacheKey(owner: string, repo: string, path: string): string {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}/${path}`;
}

export async function getCachedFile(
  owner: string,
  repo: string,
  path: string
): Promise<CachedMarkdownFile | undefined> {
  try {
    const db = await getDB();
    const key = buildCacheKey(owner, repo, path);
    return await db.get('files_cache', key);
  } catch (err) {
    console.warn('Erro ao ler do IndexedDB:', err);
    return undefined;
  }
}

export async function saveCachedFile(file: CachedMarkdownFile): Promise<void> {
  try {
    const db = await getDB();
    await db.put('files_cache', file);
  } catch (err) {
    console.warn('Erro ao salvar no IndexedDB:', err);
  }
}

export async function getAllCachedFilesForRepo(
  owner: string,
  repo: string
): Promise<CachedMarkdownFile[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('files_cache');
    const normalizedOwner = owner.toLowerCase();
    const normalizedRepo = repo.toLowerCase();
    return all.filter(
      (item) =>
        item.owner.toLowerCase() === normalizedOwner &&
        item.repo.toLowerCase() === normalizedRepo
    );
  } catch (err) {
    console.warn('Erro ao listar arquivos do cache:', err);
    return [];
  }
}

export async function clearRepoCache(owner: string, repo: string): Promise<void> {
  try {
    const db = await getDB();
    const items = await getAllCachedFilesForRepo(owner, repo);
    const tx = db.transaction('files_cache', 'readwrite');
    for (const item of items) {
      await tx.store.delete(item.key);
    }
    await tx.done;
  } catch (err) {
    console.warn('Erro ao limpar cache:', err);
  }
}
