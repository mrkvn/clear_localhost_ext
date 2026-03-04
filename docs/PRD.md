# Clear Localhost — Product Requirements Document

## 1. Executive Summary

**Clear Localhost** is a Chrome extension designed for web developers who need to quickly clear all browser data associated with localhost during development. With a single click on the toolbar icon, it removes cookies, cache, localStorage, sessionStorage, IndexedDB, and service workers for `localhost` and `127.0.0.1` across all ports.

This eliminates the repetitive workflow of closing and reopening incognito windows or manually navigating to `chrome://settings/content/all` to clear site data. The extension provides a zero-friction, instant reset to a clean browser state for local development.

The MVP delivers a minimal, toolbar-icon-only experience: click the icon, all localhost data is cleared, and a brief notification confirms the action.

## 2. Mission

**Mission:** Give web developers an instant, one-click way to reset their browser's localhost state during development.

**Core Principles:**

1. **Zero friction** — One click, no popup, no configuration needed
2. **Thorough** — Clear all data types (cookies, storage, cache, service workers, IndexedDB)
3. **Safe** — Only affects localhost and 127.0.0.1; never touches other site data
4. **Lightweight** — Minimal permissions, no background processes when idle
5. **Fast** — Clear operation completes in under a second

## 3. Target Users

**Primary Persona: Web Developer**

- Actively developing web applications locally
- Uses `localhost` or `127.0.0.1` to serve dev servers
- Frequently needs a clean browser state to test authentication flows, onboarding, caching behavior, or cookie-dependent features
- Comfortable with browser extensions and developer tools
- Frustrated by the manual process of clearing site data or cycling incognito windows

**Pain Points:**

- Closing and reopening incognito windows disrupts workflow and loses other open tabs
- Navigating to Chrome settings to clear site-specific data takes multiple clicks
- Forgetting to clear stale cookies or cached assets leads to confusing bugs during development
- No built-in Chrome shortcut to clear data for a single origin

## 4. MVP Scope

### In Scope

- ✅ Clear all cookies for `localhost` and `127.0.0.1` (all ports)
- ✅ Clear localStorage for localhost origins
- ✅ Clear sessionStorage for localhost origins
- ✅ Clear IndexedDB databases for localhost origins
- ✅ Clear cache storage for localhost origins
- ✅ Unregister service workers for localhost origins
- ✅ Toolbar icon triggers clearing immediately on click (no popup)
- ✅ Badge/notification feedback confirming data was cleared
- ✅ Manifest V3 compliance

### Out of Scope

- ❌ Popup UI or settings page
- ❌ Selective data type clearing (clear all or nothing)
- ❌ Custom domain support (e.g., `myapp.local`)
- ❌ Keyboard shortcut (can be added in future phase)
- ❌ Clear history or download records
- ❌ Cross-browser support (Chrome only for MVP)
- ❌ Data cleared log/history

## 5. User Stories

1. **As a web developer**, I want to click a single toolbar icon to clear all localhost browser data, so that I can instantly start testing with a clean slate without navigating browser settings.

2. **As a web developer**, I want visual confirmation that the data was cleared, so that I know the action completed successfully.

3. **As a web developer**, I want the extension to clear cookies, localStorage, sessionStorage, IndexedDB, cache, and service workers, so that no stale data persists across test runs.

4. **As a web developer**, I want the extension to only affect localhost and 127.0.0.1, so that my data on other websites remains untouched.

5. **As a web developer**, I want the clearing to work regardless of which port my dev server runs on, so that it works with any local development setup (e.g., :3000, :5173, :8080).

## 6. Core Architecture & Patterns

### High-Level Architecture

The extension uses a **service worker (background script)** architecture with no popup UI. The toolbar icon click is handled by `chrome.action.onClicked`, which triggers the clearing logic.

### Directory Structure

```
clear_localhost_ext/
├── src/
│   ├── background/
│   │   └── service-worker.ts       # Main entry: click handler + orchestration
│   ├── services/
│   │   ├── cookie-cleaner.ts       # Cookie clearing logic
│   │   ├── storage-cleaner.ts      # localStorage, sessionStorage, IndexedDB
│   │   ├── cache-cleaner.ts        # Cache storage + HTTP cache
│   │   └── service-worker-cleaner.ts  # Service worker unregistration
│   ├── utils/
│   │   └── localhost.ts            # Localhost URL matching utilities
│   └── constants.ts                # Shared constants (origins, patterns)
├── assets/
│   └── icons/                      # Extension icons (16, 32, 48, 128)
├── manifest.json                   # Chrome extension manifest (V3)
├── tsconfig.json
├── package.json
└── docs/
    └── PRD.md
```

### Key Design Patterns

- **Single Responsibility:** Each cleaner service handles one data type
- **Facade Pattern:** Service worker orchestrates all cleaners through a single `clearAll()` function
- **Guard Clauses:** URL matching utilities validate origins before any clearing operations
- **Constants over magic values:** Localhost origins and patterns defined in `constants.ts`

## 7. Tools/Features

### Feature: One-Click Clear All

**Purpose:** Clear all browser data for localhost origins with a single toolbar icon click.

**Operations:**

| Data Type        | Chrome API                          | Scope                              |
| ---------------- | ----------------------------------- | ---------------------------------- |
| Cookies          | `chrome.cookies.getAll()` + `remove()` | `.localhost`, `127.0.0.1`       |
| localStorage     | `chrome.scripting.executeScript()`  | Active localhost tabs              |
| sessionStorage   | `chrome.scripting.executeScript()`  | Active localhost tabs              |
| IndexedDB        | `chrome.scripting.executeScript()`  | Active localhost tabs              |
| Cache Storage    | `chrome.browsingData.removeCache()` | localhost origins                  |
| Service Workers  | `chrome.scripting.executeScript()`  | localhost origins                  |

**Feedback:** After clearing, the extension icon displays a brief badge (e.g., checkmark or "OK") for 2 seconds to confirm completion.

## 8. Technology Stack

| Component       | Technology                  | Purpose                         |
| --------------- | --------------------------- | ------------------------------- |
| Language         | TypeScript                 | Type safety, maintainability    |
| Extension API    | Chrome Extensions MV3      | Browser integration             |
| Build Tool       | Vite                       | Fast bundling for extension     |
| Package Manager  | npm                        | Dependency management           |
| Linter           | ESLint                     | Code quality                    |
| Formatter        | Prettier                   | Consistent formatting           |
| Testing          | Vitest                     | Unit testing                    |

### Dependencies

- **Runtime:** None (uses only Chrome extension APIs)
- **Dev:** TypeScript, Vite, `@crxjs/vite-plugin` (or similar MV3 build plugin), ESLint, Prettier, Vitest

## 9. Security & Configuration

### Permissions

| Permission       | Justification                                              |
| ---------------- | ---------------------------------------------------------- |
| `cookies`        | Read and remove cookies for localhost domains               |
| `browsingData`   | Clear cache and other browsing data for specific origins    |
| `scripting`      | Execute scripts in localhost tabs to clear storage/IndexedDB |
| `storage`        | (Optional) Persist user preferences in future phases        |

### Host Permissions

```json
"host_permissions": [
  "http://localhost/*",
  "http://127.0.0.1/*",
  "https://localhost/*",
  "https://127.0.0.1/*"
]
```

### Security Scope

- **In scope:** The extension only operates on `localhost` and `127.0.0.1` origins
- **Out of scope:** No data is collected, transmitted, or stored externally
- **No remote code:** All logic runs locally within the extension
- **No network requests:** The extension makes zero external network calls

### Configuration

- No user configuration for MVP
- All behavior is hardcoded to localhost/127.0.0.1 clearing

## 10. API Specification

Not applicable — this extension has no external API. All operations use Chrome extension APIs internally.

## 11. Success Criteria

### MVP Success Definition

The extension clears all localhost browser data in a single click with confirmation feedback.

### Functional Requirements

- ✅ Clicking the toolbar icon clears all cookies for localhost and 127.0.0.1
- ✅ Clicking the toolbar icon clears localStorage in all open localhost tabs
- ✅ Clicking the toolbar icon clears sessionStorage in all open localhost tabs
- ✅ Clicking the toolbar icon clears IndexedDB in all open localhost tabs
- ✅ Clicking the toolbar icon clears cache for localhost origins
- ✅ Clicking the toolbar icon unregisters service workers for localhost origins
- ✅ Visual feedback confirms the clear operation completed
- ✅ No data outside localhost/127.0.0.1 is affected
- ✅ Works across all ports (e.g., :3000, :5173, :8080)

### Quality Indicators

- Clear operation completes in under 1 second
- Extension uses less than 1MB of memory when idle
- No errors in Chrome DevTools console during operation

## 12. Implementation Phases

### Phase 1: Foundation (MVP)

**Goal:** Working extension that clears all localhost data on icon click.

**Deliverables:**

- ✅ Project scaffolding (TypeScript, Vite, manifest.json)
- ✅ Service worker with `chrome.action.onClicked` handler
- ✅ Cookie clearing for localhost/127.0.0.1
- ✅ localStorage and sessionStorage clearing via scripting API
- ✅ IndexedDB clearing via scripting API
- ✅ Cache clearing via browsingData API
- ✅ Service worker unregistration
- ✅ Badge feedback on completion
- ✅ Extension icons (all required sizes)

**Validation:** Install as unpacked extension, run local dev server, create test data, click icon, verify all data is cleared.

### Phase 2: Polish

**Goal:** Improve reliability and developer experience.

**Deliverables:**

- ❌ Keyboard shortcut support (configurable via Chrome shortcuts)
- ❌ Error handling with user-facing error badges
- ❌ Automated tests for cleaner services
- ❌ Chrome Web Store listing and assets

### Phase 3: Enhanced Features

**Goal:** Add configurability and expanded scope.

**Deliverables:**

- ❌ Popup UI with selective data type clearing
- ❌ Settings page for custom domains
- ❌ Clear history/log of past operations
- ❌ Context menu integration ("Clear data for this tab")

## 13. Future Considerations

- **Custom domain support:** Allow users to add patterns like `*.local`, `myapp.test`
- **Firefox/Edge ports:** Adapt for other Chromium and non-Chromium browsers
- **Selective clearing:** Let users choose which data types to clear
- **Auto-clear on tab close:** Optionally clear data when a localhost tab is closed
- **DevTools panel integration:** Embed clearing controls in Chrome DevTools
- **Port-specific clearing:** Clear data only for a specific port

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| `chrome.browsingData` may not support origin-specific cache clearing | Cache may not be fully cleared for localhost only | Fall back to clearing all cache with user confirmation, or use `caches.delete()` via scripting API |
| `chrome.scripting.executeScript` requires active tabs | Storage in tabs not currently open won't be cleared | Document this limitation; use `browsingData` API where possible for broader clearing |
| Manifest V3 service worker lifecycle (auto-suspend) | Long clearing operations may be interrupted | Keep clearing operations fast and synchronous where possible |
| Chrome API permission changes in future Chrome versions | Extension may break on Chrome updates | Pin minimum Chrome version; monitor Chrome extension API changelogs |

## 15. Appendix

### Related Resources

- [Chrome Extensions Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [chrome.browsingData API](https://developer.chrome.com/docs/extensions/reference/browsingData/)
- [chrome.cookies API](https://developer.chrome.com/docs/extensions/reference/cookies/)
- [chrome.scripting API](https://developer.chrome.com/docs/extensions/reference/scripting/)
- [chrome.action API](https://developer.chrome.com/docs/extensions/reference/action/)

### Localhost Origins Covered

```
http://localhost:*
https://localhost:*
http://127.0.0.1:*
https://127.0.0.1:*
```
