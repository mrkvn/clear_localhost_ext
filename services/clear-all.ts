import { clearBrowsingData } from '@/services/browsing-data-cleaner';
import { clearCookies } from '@/services/cookie-cleaner';
import { clearHistory } from '@/services/history-cleaner';
import { clearTabData } from '@/services/tab-data-cleaner';
import { refreshTabs } from '@/services/tab-refresher';
import type { PortScopedOrigins } from '@/utils/local-dev';

export interface ClearResult {
  success: boolean;
  errors: string[];
}

export async function clearAll(
  scopedOrigins: PortScopedOrigins,
  port: string,
): Promise<ClearResult> {
  const errors: string[] = [];

  const fastResults = await Promise.allSettled([
    clearTabData(scopedOrigins.portUrlPatterns, port),
    clearCookies(scopedOrigins.cookieOrigins),
    clearHistory(port),
  ]);

  for (const result of fastResults) {
    if (result.status === 'rejected') {
      const reason = result.reason;
      errors.push(reason instanceof Error ? reason.message : String(reason));
    }
  }

  try {
    await refreshTabs(scopedOrigins.portUrlPatterns, port);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  clearBrowsingData(scopedOrigins.portOrigins).catch((error) => {
    console.error('clearBrowsingData failed:', error);
  });

  return { success: errors.length === 0, errors };
}
