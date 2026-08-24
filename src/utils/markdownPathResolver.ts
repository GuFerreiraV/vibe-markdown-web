import { RepositoryTarget } from '../types/github';

const SAFE_IMAGE_DATA_URI_REGEX = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i;
const DANGEROUS_PROTOCOLS_REGEX = /^(javascript|vbscript|data):/i;

export function isSafeUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();

  // Permite âncoras locais e links relativos
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true;
  }

  // Se possuir protocolo perigoso (javascript:, vbscript:, data:)
  if (DANGEROUS_PROTOCOLS_REGEX.test(trimmed)) {
    return false;
  }

  // Permite protocolos web seguros
  try {
    const parsed = new URL(trimmed, 'https://placeholder.local');
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isSafeImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return true;
  }

  if (SAFE_IMAGE_DATA_URI_REGEX.test(trimmed)) {
    return true;
  }

  // Caminhos relativos
  if (!DANGEROUS_PROTOCOLS_REGEX.test(trimmed)) {
    return true;
  }

  return false;
}

export function resolveRelativePath(baseDirectory: string, relativePath: string): string {
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('//') || relativePath.startsWith('data:')) {
    return relativePath;
  }

  const cleanRelative = relativePath.split('?')[0].split('#')[0];
  const queryAndHash = relativePath.slice(cleanRelative.length);

  const baseSegments = baseDirectory ? baseDirectory.split('/').filter(Boolean) : [];
  const relativeSegments = cleanRelative.split('/').filter(Boolean);

  const resultSegments = [...baseSegments];

  for (const segment of relativeSegments) {
    if (segment === '.') {
      continue;
    } else if (segment === '..') {
      if (resultSegments.length > 0) {
        resultSegments.pop();
      }
    } else {
      resultSegments.push(segment);
    }
  }

  return resultSegments.join('/') + queryAndHash;
}

export function resolveGitHubImageUrl(
  target: RepositoryTarget,
  currentFileDir: string,
  imageSrc: string
): string {
  if (!imageSrc || !isSafeImageUrl(imageSrc)) {
    return '';
  }

  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('data:')) {
    return imageSrc;
  }

  const resolvedPath = resolveRelativePath(currentFileDir, imageSrc);
  const encodedPath = resolvedPath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const safeOwner = encodeURIComponent(target.owner);
  const safeRepo = encodeURIComponent(target.repo);
  const safeBranch = encodeURIComponent(target.branch);

  return `https://raw.githubusercontent.com/${safeOwner}/${safeRepo}/${safeBranch}/${encodedPath}`;
}

export function isInternalMarkdownLink(href?: string): boolean {
  if (!href || !isSafeUrl(href)) return false;
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#')) {
    return false;
  }
  const cleanHref = href.split('?')[0].split('#')[0].toLowerCase();
  return cleanHref.endsWith('.md');
}
