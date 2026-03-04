const DATA_TYPES: chrome.browsingData.DataTypeSet = {
  cache: true,
  webSQL: true,
  fileSystems: true,
};

export async function clearBrowsingData(origins: string[]): Promise<void> {
  if (origins.length === 0) return;

  await chrome.browsingData.remove({ origins }, DATA_TYPES);
}
