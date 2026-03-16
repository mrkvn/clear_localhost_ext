import { originsToHostPatterns } from '@/utils/local-dev';

export interface PermissionResult {
  granted: string[];
  denied: string[];
}

export async function checkExistingPermissions(origins: string[]): Promise<PermissionResult> {
  const granted: string[] = [];
  const denied: string[] = [];

  const hostPatternToOrigins = new Map<string, string[]>();

  for (const origin of origins) {
    try {
      const url = new URL(origin);
      const pattern = `${url.protocol}//${url.hostname}/*`;
      const existing = hostPatternToOrigins.get(pattern) ?? [];
      existing.push(origin);
      hostPatternToOrigins.set(pattern, existing);
    } catch {
      denied.push(origin);
    }
  }

  for (const [pattern, patternOrigins] of hostPatternToOrigins) {
    const hasPermission = await chrome.permissions.contains({
      origins: [pattern],
    });

    if (hasPermission) {
      granted.push(...patternOrigins);
    } else {
      denied.push(...patternOrigins);
    }
  }

  return { granted, denied };
}

async function requestPermissions(origins: string[]): Promise<boolean> {
  if (origins.length === 0) return true;

  const hostPatterns = originsToHostPatterns(origins);
  if (hostPatterns.length === 0) return true;

  try {
    return await chrome.permissions.request({ origins: hostPatterns });
  } catch {
    return false;
  }
}

export async function ensurePermissions(origins: string[]): Promise<PermissionResult> {
  if (origins.length === 0) {
    return { granted: [], denied: [] };
  }

  const initial = await checkExistingPermissions(origins);

  if (initial.denied.length === 0) {
    return initial;
  }

  const wasGranted = await requestPermissions(initial.denied);

  if (wasGranted) {
    return {
      granted: [...initial.granted, ...initial.denied],
      denied: [],
    };
  }

  return initial;
}
