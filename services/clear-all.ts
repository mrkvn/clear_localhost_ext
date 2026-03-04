import { discoverLocalhostOrigins } from '@/services/origin-discovery';
import { clearBrowsingData } from '@/services/browsing-data-cleaner';
import { clearCookies } from '@/services/cookie-cleaner';
import { clearHistory } from '@/services/history-cleaner';
import { clearTabData } from '@/services/tab-data-cleaner';

export interface ClearResult {
  success: boolean;
  errors: string[];
}

export async function clearAll(): Promise<ClearResult> {
  const origins = await discoverLocalhostOrigins();

  const results = await Promise.allSettled([
    clearTabData(),
    clearBrowsingData(origins),
    clearCookies(origins),
    clearHistory(),
  ]);

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));

  return { success: errors.length === 0, errors };
}
