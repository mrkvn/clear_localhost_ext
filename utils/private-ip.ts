const PRIVATE_SUBNET_PREFIX = '192.168.0.';
const PRIVATE_SUBNET_OCTET_MAX = 255;

export const PRIVATE_IP_HISTORY_SEARCH_TERMS: readonly string[] = ['192.168.0.'] as const;

export function isPrivateIpHostname(hostname: string): boolean {
  if (!hostname.startsWith(PRIVATE_SUBNET_PREFIX)) return false;

  const lastOctet = hostname.slice(PRIVATE_SUBNET_PREFIX.length);
  const num = Number(lastOctet);

  return Number.isInteger(num) && num >= 0 && num <= PRIVATE_SUBNET_OCTET_MAX;
}

export function isPrivateIpUrl(url: string): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return isPrivateIpHostname(hostname);
  } catch {
    return false;
  }
}
