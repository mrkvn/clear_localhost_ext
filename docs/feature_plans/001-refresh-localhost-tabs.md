# Feature: Refresh All Localhost Tabs After Clearing Data

## Status: Implemented

## Summary

After the extension clears all localhost data, automatically refresh all open localhost/127.0.0.1 tabs so developers see a clean slate without manually reloading.

## Motivation

Currently, developers must manually reload localhost tabs after clearing data. This adds friction to the workflow. By refreshing tabs automatically after clearing, the extension provides a seamless one-click experience.

## Design Decisions

- **Sequential execution:** Refresh happens after all clearing completes, not in parallel, to ensure data is fully cleared before reload.
- **All ports:** Refreshes all localhost tabs regardless of port number.
- **No new permissions:** `chrome.tabs.reload()` works with existing `host_permissions`.
- **Single-responsibility:** New `tab-refresher.ts` service follows the existing pattern of one service per concern.

## Files

| File | Action | Description |
|------|--------|-------------|
| `services/tab-refresher.ts` | Create | Query and reload all localhost tabs |
| `services/clear-all.ts` | Update | Call refresher after clearing completes |
| `docs/feature_plans/001-refresh-localhost-tabs.md` | Create | This feature plan |

## Verification

1. `npm run build`
2. Reload extension from `.output/chrome-mv3/`
3. Open `http://localhost:3000` (or any port) in a tab
4. Click extension icon
5. Verify: tab refreshes automatically after data is cleared
