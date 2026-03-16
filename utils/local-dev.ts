import { isLocalhostUrl } from '@/utils/localhost';
import { isPrivateIpUrl } from '@/utils/private-ip';

const LOCALHOST_HOSTNAMES = ['localhost', '127.0.0.1'] as const;
const PROTOCOLS = ['http:', 'https:'] as const;

export interface PortScopedOrigins {
  /** Port-specific origins for browsingData, history */
  portOrigins: string[];
  /** Portless origins for cookies (RFC 6265: cookies are domain-scoped, not port-scoped) */
  cookieOrigins: string[];
  /** URL patterns for chrome.tabs.query */
  portUrlPatterns: string[];
}

export function isLocalDevUrl(url: string): boolean {
  return isLocalhostUrl(url) || isPrivateIpUrl(url);
}

export function extractPortFromUrl(url: string): string | null {
  try {
    return new URL(url).port;
  } catch {
    return null;
  }
}

export function buildPortScopedOrigins(
  port: string,
  privateIpHostnames: string[],
): PortScopedOrigins {
  const allHostnames = [...LOCALHOST_HOSTNAMES, ...privateIpHostnames];
  const portSuffix = port ? `:${port}` : '';

  const portOrigins: string[] = [];
  const cookieOrigins: string[] = [];
  const portUrlPatterns: string[] = [];

  for (const hostname of allHostnames) {
    for (const protocol of PROTOCOLS) {
      portOrigins.push(`${protocol}//${hostname}${portSuffix}`);
      cookieOrigins.push(`${protocol}//${hostname}`);
      portUrlPatterns.push(`${protocol}//${hostname}${portSuffix}/*`);
    }
  }

  return { portOrigins, cookieOrigins, portUrlPatterns };
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
