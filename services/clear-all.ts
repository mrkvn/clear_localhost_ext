import { discoverLocalhostOrigins } from '@/services/origin-discovery';
import { clearBrowsingData } from '@/services/browsing-data-cleaner';
import { clearCookies } from '@/services/cookie-cleaner';
import { clearHistory } from '@/services/history-cleaner';
import { clearTabData } from '@/services/tab-data-cleaner';
import { refreshLocalhostTabs } from '@/services/tab-refresher';

export interface ClearResult {
  success: boolean;
  errors: string[];
}

export async function clearAll(): Promise<ClearResult> {
  const origins = await discoverLocalhostOrigins();
  const errors: string[] = [];

  const fastResults = await Promise.allSettled([
    clearTabData(),
    clearCookies(origins),
    clearHistory(),
  ]);

  for (const result of fastResults) {
    if (result.status === 'rejected') {
      const reason = result.reason;
      errors.push(reason instanceof Error ? reason.message : String(reason));
    }
  }

  try {
    await refreshLocalhostTabs();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  clearBrowsingData(origins).catch((error) => {
    console.error('clearBrowsingData failed:', error);
  });

  return { success: errors.length === 0, errors };
}
