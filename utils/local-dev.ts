import { isLocalhostUrl } from '@/utils/localhost';
import { isPrivateIpUrl } from '@/utils/private-ip';

export function isLocalDevUrl(url: string): boolean {
  return isLocalhostUrl(url) || isPrivateIpUrl(url);
}

export function originsToUrlPatterns(origins: string[]): string[] {
  return origins.map((origin) => `${origin}/*`);
}

export function originsToHostPatterns(origins: string[]): string[] {
  const unique = new Set<string>();

  for (const origin of origins) {
    try {
      const url = new URL(origin);
      unique.add(`${url.protocol}//${url.hostname}/*`);
    } catch {
      // skip invalid origins
    }
  }

  return [...unique];
}
