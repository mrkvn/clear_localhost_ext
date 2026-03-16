import { LOCALHOST_URL_PATTERNS } from '@/utils/localhost';

export async function refreshTabs(
  urlPatterns: string[] = [...LOCALHOST_URL_PATTERNS],
  portFilter?: string,
): Promise<void> {
  if (urlPatterns.length === 0) return;

  let tabs = await chrome.tabs.query({ url: urlPatterns });

  if (portFilter !== undefined) {
    tabs = tabs.filter((tab) => {
      if (!tab.url) return false;
      try {
        return new URL(tab.url).port === portFilter;
      } catch {
        return false;
      }
    });
  }

  const tabIds = tabs.map((tab) => tab.id).filter((id): id is number => id !== undefined);

  if (tabIds.length === 0) return;

  await Promise.all(tabIds.map((tabId) => chrome.tabs.reload(tabId, { bypassCache: true })));
}
