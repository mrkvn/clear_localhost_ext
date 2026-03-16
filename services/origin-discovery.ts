import { extractOrigin, isLocalhostUrl, LOCALHOST_ORIGINS } from '@/utils/localhost';
import { isPrivateIpUrl, PRIVATE_IP_HISTORY_SEARCH_TERMS } from '@/utils/private-ip';

const MAX_HISTORY_RESULTS = 10000;

const LOCALHOST_SEARCH_TERMS: readonly string[] = ['localhost', '127.0.0.1'] as const;

export interface DiscoveredOrigins {
  localhostOrigins: string[];
  privateIpOrigins: string[];
}

async function searchHistoryForOrigins(
  searchTerms: readonly string[],
  filterFn: (url: string) => boolean,
): Promise<string[]> {
  const results = await Promise.all(
    searchTerms.map((text) =>
      chrome.history.search({
        text,
        startTime: 0,
        maxResults: MAX_HISTORY_RESULTS,
      }),
    ),
  );

  return results
    .flat()
    .map((entry) => entry.url)
    .filter((url): url is string => url !== undefined)
    .filter(filterFn)
    .map(extractOrigin);
}

function filterTabOrigins(tabs: chrome.tabs.Tab[], filterFn: (url: string) => boolean): string[] {
  return tabs
    .map((tab) => tab.url)
    .filter((url): url is string => url !== undefined)
    .filter(filterFn)
    .map(extractOrigin);
}

export async function discoverLocalhostOrigins(): Promise<string[]> {
  const tabs = await chrome.tabs.query({});

  const [historyOrigins] = await Promise.all([
    searchHistoryForOrigins(LOCALHOST_SEARCH_TERMS, isLocalhostUrl),
  ]);

  const tabOrigins = filterTabOrigins(tabs, isLocalhostUrl);

  const unique = new Set([...LOCALHOST_ORIGINS, ...historyOrigins, ...tabOrigins]);

  return [...unique];
}

export async function discoverAllOrigins(): Promise<DiscoveredOrigins> {
  const tabs = await chrome.tabs.query({});

  const [localhostHistoryOrigins, privateIpHistoryOrigins] = await Promise.all([
    searchHistoryForOrigins(LOCALHOST_SEARCH_TERMS, isLocalhostUrl),
    searchHistoryForOrigins(PRIVATE_IP_HISTORY_SEARCH_TERMS, isPrivateIpUrl),
  ]);

  const localhostTabOrigins = filterTabOrigins(tabs, isLocalhostUrl);
  const privateIpTabOrigins = filterTabOrigins(tabs, isPrivateIpUrl);

  const localhostOrigins = [
    ...new Set([...LOCALHOST_ORIGINS, ...localhostHistoryOrigins, ...localhostTabOrigins]),
  ];

  const privateIpOrigins = [...new Set([...privateIpHistoryOrigins, ...privateIpTabOrigins])];

  return { localhostOrigins, privateIpOrigins };
}

function extractHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export async function discoverPrivateIpHostnames(): Promise<string[]> {
  const tabs = await chrome.tabs.query({});

  const historyResults = await Promise.all(
    PRIVATE_IP_HISTORY_SEARCH_TERMS.map((text) =>
      chrome.history.search({
        text,
        startTime: 0,
        maxResults: MAX_HISTORY_RESULTS,
      }),
    ),
  );

  const historyUrls = historyResults
    .flat()
    .map((entry) => entry.url)
    .filter((url): url is string => url !== undefined)
    .filter(isPrivateIpUrl);

  const tabUrls = tabs
    .map((tab) => tab.url)
    .filter((url): url is string => url !== undefined)
    .filter(isPrivateIpUrl);

  const hostnames = [...historyUrls, ...tabUrls]
    .map(extractHostname)
    .filter((h): h is string => h !== null);

  return [...new Set(hostnames)];
}
