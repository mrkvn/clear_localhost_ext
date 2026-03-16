import { isLocalDevUrl } from '@/utils/local-dev';

const MAX_HISTORY_RESULTS = 10000;

const HISTORY_SEARCH_TERMS: readonly string[] = ['localhost', '127.0.0.1', '192.168.0.'] as const;

export async function clearHistory(): Promise<void> {
  const results = await Promise.all(
    HISTORY_SEARCH_TERMS.map((text) =>
      chrome.history.search({
        text,
        startTime: 0,
        maxResults: MAX_HISTORY_RESULTS,
      }),
    ),
  );

  const uniqueUrls = new Set(
    results
      .flat()
      .map((entry) => entry.url)
      .filter((url): url is string => url !== undefined)
      .filter(isLocalDevUrl),
  );

  await Promise.all([...uniqueUrls].map((url) => chrome.history.deleteUrl({ url })));
}
