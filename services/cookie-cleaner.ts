export async function clearCookies(origins: string[]): Promise<void> {
  if (origins.length === 0) return;

  const allCookies = await Promise.all(
    origins.map((origin) => chrome.cookies.getAll({ url: origin })),
  );

  const seen = new Set<string>();
  const removals: Promise<chrome.cookies.Cookie | null>[] = [];

  for (const cookie of allCookies.flat()) {
    const key = `${cookie.domain}|${cookie.name}|${cookie.path}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const protocol = cookie.secure ? 'https' : 'http';
    const url = `${protocol}://${cookie.domain}${cookie.path}`;
    removals.push(chrome.cookies.remove({ url, name: cookie.name }));
  }

  await Promise.all(removals);
}
