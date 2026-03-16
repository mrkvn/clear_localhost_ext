import { LOCALHOST_URL_PATTERNS } from '@/utils/localhost';

export async function refreshTabs(
  urlPatterns: string[] = [...LOCALHOST_URL_PATTERNS],
): Promise<void> {
  if (urlPatterns.length === 0) return;

  const tabs = await chrome.tabs.query({ url: urlPatterns });

  const tabIds = tabs.map((tab) => tab.id).filter((id): id is number => id !== undefined);

  if (tabIds.length === 0) return;

  await Promise.all(tabIds.map((tabId) => chrome.tabs.reload(tabId, { bypassCache: true })));
}
