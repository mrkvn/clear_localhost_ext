import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/auto-icons'],
  manifest: {
    name: 'Clear Localhost',
    description: 'One-click clear all browser data for localhost, 127.0.0.1, and local network IPs',
    permissions: ['browsingData', 'cookies', 'history', 'scripting', 'tabs'],
    host_permissions: [
      'http://localhost/*',
      'http://127.0.0.1/*',
      'https://localhost/*',
      'https://127.0.0.1/*',
    ],
    optional_host_permissions: ['<all_urls>'],
    action: {},
  },
});
