# Feature: Clear Private Network IP (192.168.0.*) Browser Data

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Extend the Clear Localhost extension to dynamically discover and clear browser data for private IP addresses in the 192.168.0.0/24 subnet. The user frequently tests web apps from other devices (especially phones for mobile views) by accessing their dev server via the device's local IP (e.g., `http://192.168.0.105:3000`). This feature discovers such IPs from browser history and open tabs, requests host permissions at runtime, and clears all data types (cookies, storage, cache, service workers, etc.) for those origins.

## User Story

As a web developer
I want the extension to also clear browser data for my device's local network IP (192.168.0.*)
So that I get a clean browser state for cross-device testing without manually clearing data for each IP

## Problem Statement

The extension currently only clears data for `localhost` and `127.0.0.1`. When developers test their apps from other devices using the machine's local network IP (e.g., `http://192.168.0.105:3000`), stale cookies, localStorage, and cached assets persist, causing confusing bugs during cross-device testing.

## Solution Statement

Extend the origin discovery system to also find 192.168.0.* addresses in browser history and open tabs. Use Chrome's optional host permissions API to request access to discovered private IPs at runtime (one-time dialog per IP). Clear all data types for those origins using the same clearing pipeline as localhost.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: origin-discovery, clear-all orchestrator, tab-data-cleaner, tab-refresher, history-cleaner, manifest permissions
**Dependencies**: No new external libraries required

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `utils/localhost.ts` — Pattern to mirror for new `utils/private-ip.ts`. Contains `isLocalhostUrl()`, `extractOrigin()`, `LOCALHOST_ORIGINS`, `LOCALHOST_URL_PATTERNS`
- `services/origin-discovery.ts` — Must be refactored with generic helpers and new `discoverAllOrigins()`. Contains `originsFromHistory()`, `originsFromTabs()`, `discoverLocalhostOrigins()`
- `services/clear-all.ts` — Central orchestrator, most significant restructuring. Contains `clearAll()` facade with 3-stage clearing
- `services/history-cleaner.ts` — Extend search terms and filter. Contains `clearHistory()` with hardcoded localhost search terms
- `services/tab-data-cleaner.ts` — Parameterize URL patterns. Contains `clearTabData()` using static `LOCALHOST_URL_PATTERNS`
- `services/tab-refresher.ts` — Parameterize URL patterns. Contains `refreshLocalhostTabs()` using static `LOCALHOST_URL_PATTERNS`
- `utils/badge.ts` — Add partial badge type. Contains `showBadge()` with success/error types
- `entrypoints/background.ts` — Handle partial result. Contains `chrome.action.onClicked` listener
- `wxt.config.ts` — Add `optional_host_permissions`. Contains manifest configuration
- `services/cookie-cleaner.ts` — No changes needed, already generic. Contains `clearCookies(origins)`
- `services/browsing-data-cleaner.ts` — No changes needed, already generic. Contains `clearBrowsingData(origins)`

### New Files to Create

- `utils/private-ip.ts` — Private IP hostname validation and history search terms
- `utils/local-dev.ts` — Unified local dev URL validation + URL pattern conversion helpers
- `services/permission-manager.ts` — Runtime host permission check/request management

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Chrome Optional Permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions)
  - Section: `permissions.request()` and `permissions.contains()`
  - Why: Core API for requesting host permissions at runtime
- [Chrome Match Patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns)
  - Why: Understanding pattern format for `optional_host_permissions` and `chrome.tabs.query`
- [Chrome browsingData API](https://developer.chrome.com/docs/extensions/reference/api/browsingData)
  - Section: `remove()` with `origins` parameter
  - Why: Confirm browsingData works with private IP origins

### Patterns to Follow

**URL Validation Pattern** (from `utils/localhost.ts`):
```typescript
export function isLocalhostUrl(url: string): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}
```

**Origin Discovery Pattern** (from `services/origin-discovery.ts`):
```typescript
async function originsFromHistory(): Promise<string[]> {
  const results = await Promise.all([
    chrome.history.search({ text: 'searchTerm', startTime: 0, maxResults: 10000 }),
  ]);
  return results.flat()
    .map((entry) => entry.url)
    .filter((url): url is string => url !== undefined)
    .filter(isValidUrl)
    .map(extractOrigin);
}
```

**Error Handling**: `Promise.allSettled` for parallel operations, guard clauses with early returns

**Naming Conventions**: camelCase functions, PascalCase interfaces, SCREAMING_SNAKE_CASE constants

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation — New Utility Modules

Create `utils/private-ip.ts` with hostname validation for 192.168.0.* and history search terms. Create `utils/local-dev.ts` with unified `isLocalDevUrl()` and URL pattern conversion helpers.

### Phase 2: Permission Manager

Create `services/permission-manager.ts` with `ensurePermissions()` that checks existing grants via `chrome.permissions.contains()`, then requests missing ones via `chrome.permissions.request()`. Returns `{ granted, denied }` for graceful degradation.

### Phase 3: Extend Discovery & Clearing Services

Refactor `services/origin-discovery.ts` with generic helpers and new `discoverAllOrigins()`. Update `services/history-cleaner.ts` to search for private IP history entries. Parameterize `services/tab-data-cleaner.ts` and `services/tab-refresher.ts` to accept dynamic URL patterns.

### Phase 4: Orchestrator & UI

Restructure `services/clear-all.ts` to discover all origins, request permissions, and pass dynamic patterns. Add `partial` badge type. Update manifest with `optional_host_permissions`.

---

## STEP-BY-STEP TASKS

### 1. CREATE `utils/private-ip.ts`

- **IMPLEMENT**: `isPrivateIpHostname(hostname)` — check `192.168.0.` prefix, parse last octet as integer, validate 0-255 range
- **IMPLEMENT**: `isPrivateIpUrl(url)` — parse URL, extract hostname, delegate to `isPrivateIpHostname`
- **IMPLEMENT**: `PRIVATE_IP_HISTORY_SEARCH_TERMS` = `['192.168.0.']` as const
- **PATTERN**: Mirror `utils/localhost.ts` guard-clause + try-catch URL parsing pattern
- **VALIDATE**: `npx wxt build`

### 2. CREATE `utils/local-dev.ts`

- **IMPLEMENT**: `isLocalDevUrl(url)` — `isLocalhostUrl(url) || isPrivateIpUrl(url)`
- **IMPLEMENT**: `originsToUrlPatterns(origins)` — map each origin to `${origin}/*` (preserves port for `chrome.tabs.query`)
- **IMPLEMENT**: `originsToHostPatterns(origins)` — parse URL, strip port, build `${protocol}//${hostname}/*` patterns (for `chrome.permissions.request`), deduplicate via Set
- **IMPORTS**: `isLocalhostUrl` from `@/utils/localhost`, `isPrivateIpUrl` from `@/utils/private-ip`
- **VALIDATE**: `npx wxt build`

### 3. CREATE `services/permission-manager.ts`

- **IMPLEMENT**: `PermissionResult` interface: `{ granted: string[], denied: string[] }`
- **IMPLEMENT**: `ensurePermissions(origins)`:
  1. Group origins by host pattern (using `originsToHostPatterns` logic) to avoid redundant checks
  2. For each unique host pattern, check `chrome.permissions.contains({ origins: [pattern] })`
  3. Collect origins into granted/denied buckets
  4. If any denied, call `chrome.permissions.request({ origins: deniedHostPatterns })` — single batched request
  5. If request granted, move all denied → granted
  6. If request denied, return as-is (graceful degradation)
- **IMPORTS**: `originsToHostPatterns` from `@/utils/local-dev`
- **GOTCHA**: `chrome.permissions.request()` must be in user-gesture promise chain from `chrome.action.onClicked`; permission patterns don't support ports
- **VALIDATE**: `npx wxt build`

### 4. UPDATE `services/origin-discovery.ts`

- **REFACTOR**: Extract `searchHistoryForOrigins(searchTerms: readonly string[], filterFn: (url: string) => boolean): Promise<string[]>` — generic history search helper
- **REFACTOR**: Extract `filterTabOrigins(tabs: chrome.tabs.Tab[], filterFn: (url: string) => boolean): string[]` — generic tab filter helper
- **ADD**: `DiscoveredOrigins` interface: `{ localhostOrigins: string[], privateIpOrigins: string[] }`
- **ADD**: `discoverAllOrigins(): Promise<DiscoveredOrigins>`:
  1. Single `chrome.tabs.query({})` call
  2. Parallel: `searchHistoryForOrigins(['localhost', '127.0.0.1'], isLocalhostUrl)` and `searchHistoryForOrigins(['192.168.0.'], isPrivateIpUrl)`
  3. `filterTabOrigins(tabs, isLocalhostUrl)` and `filterTabOrigins(tabs, isPrivateIpUrl)`
  4. Deduplicate each set, return partitioned
- **KEEP**: `discoverLocalhostOrigins()` for backward compat (refactor to use new helpers internally)
- **IMPORTS**: Add `isPrivateIpUrl`, `PRIVATE_IP_HISTORY_SEARCH_TERMS` from `@/utils/private-ip`
- **VALIDATE**: `npx wxt build`

### 5. UPDATE `services/history-cleaner.ts`

- **ADD**: `'192.168.0.'` to search terms (make it an array constant: `['localhost', '127.0.0.1', '192.168.0.']`)
- **REPLACE**: `isLocalhostUrl` filter → `isLocalDevUrl` from `@/utils/local-dev`
- **IMPORTS**: Replace `import { isLocalhostUrl } from '@/utils/localhost'` with `import { isLocalDevUrl } from '@/utils/local-dev'`
- **NOTE**: `chrome.history.deleteUrl` does NOT require host_permissions — always works for any URL
- **VALIDATE**: `npx wxt build`

### 6. UPDATE `services/tab-data-cleaner.ts`

- **CHANGE**: `clearTabData()` → `clearTabData(urlPatterns: string[] = [...LOCALHOST_URL_PATTERNS])`
- **ADD**: Guard clause `if (urlPatterns.length === 0) return;` at the start
- **NO OTHER CHANGES**: The injected `clearAllTabData` function and tab querying logic stay the same
- **VALIDATE**: `npx wxt build`

### 7. UPDATE `services/tab-refresher.ts`

- **RENAME**: `refreshLocalhostTabs` → `refreshTabs`
- **CHANGE**: `refreshTabs(urlPatterns: string[] = [...LOCALHOST_URL_PATTERNS])`
- **ADD**: Guard clause `if (urlPatterns.length === 0) return;`
- **VALIDATE**: `npx wxt build`

### 8. UPDATE `utils/badge.ts`

- **ADD**: `partial: '#FF9800'` to `BADGE_COLORS` object
- **REFACTOR**: Replace ternary text logic with `BADGE_TEXT` map: `{ success: 'OK', partial: 'OK', error: 'ERR' } as const`
- **UPDATE**: `showBadge` to use `BADGE_TEXT[type]` instead of ternary
- **VALIDATE**: `npx wxt build`

### 9. UPDATE `services/clear-all.ts`

- **REPLACE**: Import `discoverLocalhostOrigins` → `discoverAllOrigins` from `@/services/origin-discovery`
- **ADD**: Import `ensurePermissions` from `@/services/permission-manager`
- **ADD**: Import `originsToUrlPatterns` from `@/utils/local-dev`
- **ADD**: Import `LOCALHOST_URL_PATTERNS` from `@/utils/localhost`
- **REPLACE**: Import `refreshLocalhostTabs` → `refreshTabs` from `@/services/tab-refresher`
- **ADD**: `partial: boolean` field to `ClearResult` interface
- **REWRITE**: `clearAll()` body:
  1. `const { localhostOrigins, privateIpOrigins } = await discoverAllOrigins()`
  2. Request permissions: `const permResult = await ensurePermissions(privateIpOrigins)`
  3. Track `partial = permResult.denied.length > 0`
  4. Merge: `const allOrigins = [...localhostOrigins, ...permResult.granted]`
  5. Build patterns: `const allUrlPatterns = [...LOCALHOST_URL_PATTERNS, ...originsToUrlPatterns(permResult.granted)]`
  6. Fast stage: `Promise.allSettled([clearTabData(allUrlPatterns), clearCookies(allOrigins), clearHistory()])`
  7. Refresh: `await refreshTabs(allUrlPatterns)`
  8. Fire-and-forget: `clearBrowsingData(allOrigins).catch(...)`
  9. Return `{ success: errors.length === 0, partial, errors }`
- **VALIDATE**: `npx wxt build`

### 10. UPDATE `entrypoints/background.ts`

- **UPDATE**: Badge logic to handle `partial`:
  - `result.success && !result.partial` → `showBadge('success')`
  - `result.success && result.partial` → `showBadge('partial')`
  - `!result.success` → `showBadge('error')`
- **VALIDATE**: `npx wxt build`

### 11. UPDATE `wxt.config.ts`

- **ADD**: `optional_host_permissions: ['<all_urls>']` to manifest config
- **UPDATE**: `description` to `'One-click clear all browser data for localhost, 127.0.0.1, and local network IPs'`
- **VALIDATE**: `npx wxt build` and check `.output/chrome-mv3/manifest.json` contains `optional_host_permissions`

---

## TESTING STRATEGY

### Manual Testing (No test framework in project)

1. **Build**: `npx wxt build` — zero errors
2. **Lint**: `npm run lint` — zero errors
3. **Load extension**: Load from `.output/chrome-mv3/` as unpacked extension
4. **Test localhost (regression)**: Open localhost tab, set localStorage, click icon → data cleared, green badge
5. **Test private IP discovery**: Open `http://192.168.0.X:PORT` tab, click icon → permission dialog appears
6. **Test permission grant**: Grant permission → data cleared for both localhost and private IP, green badge
7. **Test permission denial**: Deny permission → localhost cleared, private IP skipped, orange badge
8. **Test subsequent clicks**: After granting → no dialog, seamless clearing
9. **Test no private IPs**: No private IP tabs/history → extension behaves exactly as before

---

## VALIDATION COMMANDS

### Level 1: Build
```bash
npx wxt build
```

### Level 2: Lint & Format
```bash
npm run lint
npm run format:check
```

### Level 3: Manifest Verification
```bash
cat .output/chrome-mv3/manifest.json | grep -A2 optional_host_permissions
```

### Level 4: Manual Validation
See Testing Strategy above — load unpacked extension and test each scenario.

---

## ACCEPTANCE CRITERIA

- [ ] Private IP (192.168.0.*) origins discovered from history and open tabs
- [ ] Permission requested at runtime via optional_host_permissions (one-time dialog)
- [ ] All data types cleared for granted private IP origins (cookies, storage, cache, etc.)
- [ ] Localhost clearing unaffected — works exactly as before
- [ ] Graceful degradation when permission denied (localhost still cleared, orange badge)
- [ ] No static/hardcoded IPs — fully dynamic discovery
- [ ] Build passes with zero errors
- [ ] Lint passes with zero errors

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] No linting or type checking errors
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

- **Chrome match patterns don't support IP wildcards** — `192.168.0.*` is not valid in `host_permissions`. Using `<all_urls>` as `optional_host_permissions` allows requesting specific IPs at runtime.
- **User gesture preservation** — `chrome.permissions.request()` works within the promise chain from `chrome.action.onClicked`. No `setTimeout` or detached promises between click and permission request.
- **Permission patterns are portless** — `http://192.168.0.5/*` grants access to all ports on that host. Tab query patterns CAN include ports.
- **History deletion needs no host_permissions** — `chrome.history.deleteUrl` only requires the `history` permission, so private IP history entries are always cleared regardless of host permission status.
- **`chrome.browsingData.remove`** — The `browsingData` permission covers all origins for cache/webSQL/fileSystems clearing. No host_permissions needed.
