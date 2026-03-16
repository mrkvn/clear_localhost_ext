import { LOCALHOST_URL_PATTERNS } from '@/utils/localhost';

function clearAllTabData(): void {
  localStorage.clear();
  sessionStorage.clear();

  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!name) return;
    document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
  });

  if ('indexedDB' in window && typeof indexedDB.databases === 'function') {
    indexedDB.databases().then((databases) => {
      databases.forEach((db) => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      });
    });
  }

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }
}

export async function clearTabData(
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

  await Promise.all(
    tabIds.map((tabId) =>
      chrome.scripting.executeScript({
        target: { tabId },
        func: clearAllTabData,
        world: 'MAIN',
      }),
    ),
  );
}
