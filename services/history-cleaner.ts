import { isLocalhostUrl } from '@/utils/localhost';

const MAX_HISTORY_RESULTS = 10000;

export async function clearHistory(): Promise<void> {
  const [localhostResults, ipResults] = await Promise.all([
    chrome.history.search({ text: 'localhost', startTime: 0, maxResults: MAX_HISTORY_RESULTS }),
    chrome.history.search({ text: '127.0.0.1', startTime: 0, maxResults: MAX_HISTORY_RESULTS }),
  ]);

  const uniqueUrls = new Set(
    [...localhostResults, ...ipResults]
      .map((entry) => entry.url)
      .filter((url): url is string => url !== undefined)
      .filter(isLocalhostUrl),
  );

  await Promise.all(
    [...uniqueUrls].map((url) => chrome.history.deleteUrl({ url })),
  );
}
