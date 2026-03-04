const BADGE_DISPLAY_MS = 1500;
const BADGE_COLORS = { success: '#4CAF50', error: '#F44336' } as const;
type BadgeType = keyof typeof BADGE_COLORS;

export async function showBadge(type: BadgeType): Promise<void> {
  const text = type === 'success' ? 'OK' : 'ERR';
  await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS[type] });
  await chrome.action.setBadgeText({ text });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), BADGE_DISPLAY_MS);
}
