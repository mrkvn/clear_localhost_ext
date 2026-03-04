export const LOCALHOST_ORIGINS: readonly string[] = [
  'http://localhost',
  'https://localhost',
  'http://127.0.0.1',
  'https://127.0.0.1',
] as const;

export const LOCALHOST_URL_PATTERNS: readonly string[] = [
  'http://localhost/*',
  'https://localhost/*',
  'http://127.0.0.1/*',
  'https://127.0.0.1/*',
] as const;

export function extractOrigin(url: string): string {
  return new URL(url).origin;
}

export function isLocalhostUrl(url: string): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}
