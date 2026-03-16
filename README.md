# Clear Localhost

One-click Chrome extension to clear all browser data for `localhost` and `127.0.0.1`.

## What It Clears

- Cookies
- localStorage
- sessionStorage
- IndexedDB
- Cache (HTTP cache)
- Service workers
- Cache storage
- WebSQL
- File systems
- Browsing history

## How It Works

1. Click the extension icon in the toolbar
2. All localhost/127.0.0.1 data is cleared across all ports
3. Open localhost tabs auto-refresh (cache bypassed)
4. Toolbar badge shows green **OK** on success or red **ERR** on failure

## Setup

```bash
git clone git@github.com:mrkvn/clear_localhost_ext.git
cd clear_localhost_ext
npm install
npm run build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3/` directory

## Usage

Click the extension icon in the toolbar. That's it.

- Green **OK** badge = all data cleared successfully
- Red **ERR** badge = one or more operations failed (check the service worker console)

## Scripts

| Script                  | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Development mode with hot reload |
| `npm run dev:firefox`   | Development mode for Firefox     |
| `npm run build`         | Production build for Chrome      |
| `npm run build:firefox` | Production build for Firefox     |
| `npm run zip`           | Create .zip for Chrome Web Store |
| `npm run zip:firefox`   | Create .zip for Firefox Add-ons  |
| `npm run lint`          | Run ESLint                       |
| `npm run format`        | Format code with Prettier        |
| `npm run format:check`  | Check formatting without writing |

## Permissions

| Permission     | Reason                                                     |
| -------------- | ---------------------------------------------------------- |
| `browsingData` | Clear cache, WebSQL, and file system data                  |
| `cookies`      | Read and remove localhost cookies                          |
| `history`      | Search and delete localhost history entries                |
| `scripting`    | Execute scripts in localhost tabs to clear in-page storage |
| `tabs`         | Query and reload localhost tabs                            |

Host permissions are scoped to `http(s)://localhost/*` and `http(s)://127.0.0.1/*` only.

## Tech Stack

- [WXT](https://wxt.dev) — Chrome extension framework (built on Vite)
- TypeScript
- Chrome Manifest V3
- ESLint + Prettier
