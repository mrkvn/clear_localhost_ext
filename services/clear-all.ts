import { clearBrowsingData } from '@/services/browsing-data-cleaner';
import { clearCookies } from '@/services/cookie-cleaner';
import { clearHistory } from '@/services/history-cleaner';
import { clearTabData } from '@/services/tab-data-cleaner';
import { refreshTabs } from '@/services/tab-refresher';
import { LOCALHOST_URL_PATTERNS } from '@/utils/localhost';
import { originsToUrlPatterns } from '@/utils/local-dev';

export interface ClearResult {
  success: boolean;
  errors: string[];
}

export async function clearAll(
  localhostOrigins: string[],
  grantedPrivateIpOrigins: string[],
): Promise<ClearResult> {
  const errors: string[] = [];

  const allOrigins = [...localhostOrigins, ...grantedPrivateIpOrigins];

  const allUrlPatterns = [
    ...LOCALHOST_URL_PATTERNS,
    ...originsToUrlPatterns(grantedPrivateIpOrigins),
  ];

  const fastResults = await Promise.allSettled([
    clearTabData(allUrlPatterns),
    clearCookies(allOrigins),
    clearHistory(),
  ]);

  for (const result of fastResults) {
    if (result.status === 'rejected') {
      const reason = result.reason;
      errors.push(reason instanceof Error ? reason.message : String(reason));
    }
  }

  try {
    await refreshTabs(allUrlPatterns);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  clearBrowsingData(allOrigins).catch((error) => {
    console.error('clearBrowsingData failed:', error);
  });

  return { success: errors.length === 0, errors };
}
