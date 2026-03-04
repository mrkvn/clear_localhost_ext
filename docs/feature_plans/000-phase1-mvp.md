# Feature: Phase 1 MVP — Clear Localhost Chrome Extension

## Status: Implemented

See the full plan in the git history or conversation transcript.

## Summary

A Chrome MV3 extension that clears all browser data for `localhost` and `127.0.0.1` with a single toolbar icon click. No popup, no settings — click → clear → badge confirmation. Built with WXT framework and vanilla TypeScript.

## Files Created

- `wxt.config.ts` — WXT config with manifest, permissions, auto-icons, empty action
- `entrypoints/background.ts` — Service worker with onClicked listener
- `services/browsing-data-cleaner.ts` — browsingData.remove() with origins filter
- `services/session-storage-cleaner.ts` — scripting.executeScript() for sessionStorage
- `services/clear-all.ts` — Orchestrator facade (Promise.allSettled)
- `utils/localhost.ts` — LOCALHOST_ORIGINS constants, isLocalhostUrl()
- `utils/badge.ts` — Badge feedback helper (showBadge)
- `assets/icon.png` — Base icon (512x512, auto-icons generates sizes)
- `eslint.config.js` — ESLint flat config
- `.prettierrc` / `.prettierignore` — Prettier config
- `.gitignore` — Ignores node_modules, .output, .wxt, dist
