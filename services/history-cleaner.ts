import { isLocalDevUrl } from '@/utils/local-dev';

const MAX_HISTORY_RESULTS = 10000;

const HISTORY_SEARCH_TERMS: readonly string[] = ['localhost', '127.0.0.1', '192.168.0.'] as const;

function matchesPort(url: string, port: string): boolean {
  try {
    return new URL(url).port === port;
  } catch {
    return false;
  }
}

export async function clearHistory(port: string): Promise<void> {
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
      .filter(isLocalDevUrl)
      .filter((url) => matchesPort(url, port)),
  );

  await Promise.all([...uniqueUrls].map((url) => chrome.history.deleteUrl({ url })));
}
