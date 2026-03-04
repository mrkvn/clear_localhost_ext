import {
  extractOrigin,
  isLocalhostUrl,
  LOCALHOST_ORIGINS,
} from '@/utils/localhost';

const MAX_HISTORY_RESULTS = 10000;

async function originsFromHistory(): Promise<string[]> {
  const [localhostResults, ipResults] = await Promise.all([
    chrome.history.search({ text: 'localhost', startTime: 0, maxResults: MAX_HISTORY_RESULTS }),
    chrome.history.search({ text: '127.0.0.1', startTime: 0, maxResults: MAX_HISTORY_RESULTS }),
  ]);

  return [...localhostResults, ...ipResults]
    .map((entry) => entry.url)
    .filter((url): url is string => url !== undefined)
    .filter(isLocalhostUrl)
    .map(extractOrigin);
}

async function originsFromTabs(): Promise<string[]> {
  const tabs = await chrome.tabs.query({});

  return tabs
    .map((tab) => tab.url)
    .filter((url): url is string => url !== undefined)
    .filter(isLocalhostUrl)
    .map(extractOrigin);
}

export async function discoverLocalhostOrigins(): Promise<string[]> {
  const [historyOrigins, tabOrigins] = await Promise.all([
    originsFromHistory(),
    originsFromTabs(),
  ]);

  const unique = new Set([
    ...LOCALHOST_ORIGINS,
    ...historyOrigins,
    ...tabOrigins,
  ]);

  return [...unique];
}
