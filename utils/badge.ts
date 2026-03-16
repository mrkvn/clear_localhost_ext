const BADGE_DISPLAY_MS = 1500;

const BADGE_COLORS = {
  success: '#4CAF50',
  partial: '#FF9800',
  error: '#F44336',
} as const;

const BADGE_TEXT = {
  success: 'OK',
  partial: 'OK',
  error: 'ERR',
} as const;

type BadgeType = keyof typeof BADGE_COLORS;

export async function showBadge(type: BadgeType): Promise<void> {
  await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS[type] });
  await chrome.action.setBadgeText({ text: BADGE_TEXT[type] });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), BADGE_DISPLAY_MS);
}
