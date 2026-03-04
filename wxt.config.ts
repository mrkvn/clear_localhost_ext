import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/auto-icons'],
  manifest: {
    name: 'Clear Localhost',
    description: 'One-click clear all browser data for localhost and 127.0.0.1',
    permissions: ['browsingData', 'cookies', 'history', 'scripting'],
    host_permissions: [
      'http://localhost/*',
      'http://127.0.0.1/*',
      'https://localhost/*',
      'https://127.0.0.1/*',
    ],
    action: {},
  },
});
