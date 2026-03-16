import { clearAll } from '@/services/clear-all';
import { discoverPrivateIpHostnames } from '@/services/origin-discovery';
import { ensurePermissions, checkExistingPermissions } from '@/services/permission-manager';
import { showBadge } from '@/utils/badge';
import { buildPortScopedOrigins, extractPortFromUrl, isLocalDevUrl } from '@/utils/local-dev';

let cachedPrivateIpHostnames: string[] = [];

function hostnamesToOrigins(hostnames: string[]): string[] {
  return hostnames.map((h) => `http://${h}`);
}

export default defineBackground(() => {
  chrome.action.onClicked.addListener(async (tab) => {
    try {
      // Step 1: Guard — only act on local dev URLs
      if (!tab.url || !isLocalDevUrl(tab.url)) {
        await showBadge('skip');
        return;
      }

      // Step 2: Extract port from active tab
      const port = extractPortFromUrl(tab.url);
      if (port === null) {
        await showBadge('skip');
        return;
      }

      // Step 3: Request permissions for previously discovered private IPs.
      // This MUST be the first await to preserve the user gesture context
      // required by chrome.permissions.request().
      const preGranted = await ensurePermissions(hostnamesToOrigins(cachedPrivateIpHostnames));

      // Step 4: Discover private IP hostnames (gesture may be lost after this point)
      const discoveredHostnames = await discoverPrivateIpHostnames();

      // Step 5: For newly discovered IPs not in cache, only check existing
      // permissions (no request — gesture is already consumed)
      const newHostnames = discoveredHostnames.filter(
        (h) => !cachedPrivateIpHostnames.includes(h),
      );
      let newGranted: string[] = [];
      if (newHostnames.length > 0) {
        const newPermResult = await checkExistingPermissions(hostnamesToOrigins(newHostnames));
        newGranted = newPermResult.granted;
      }

      // Step 6: Merge all granted private IP hostnames
      const allGrantedOrigins = [...new Set([...preGranted.granted, ...newGranted])];
      const grantedHostnames = allGrantedOrigins.map((origin) => {
        try {
          return new URL(origin).hostname;
        } catch {
          return null;
        }
      }).filter((h): h is string => h !== null);

      const allDeniedCount = preGranted.denied.length + (newHostnames.length - newGranted.length);

      // Step 7: Update cache for next click
      cachedPrivateIpHostnames = discoveredHostnames;

      // Step 8: Build port-scoped origins and clear data
      const scopedOrigins = buildPortScopedOrigins(port, grantedHostnames);
      const result = await clearAll(scopedOrigins, port);

      // Step 9: Show badge
      const partial = allDeniedCount > 0;
      if (result.success && !partial) {
        await showBadge('success');
      } else if (result.success && partial) {
        await showBadge('partial');
      } else {
        console.error('Clear errors:', result.errors);
        await showBadge('error');
      }
    } catch (error) {
      console.error('Unhandled error:', error);
      await showBadge('error');
    }
  });
});
