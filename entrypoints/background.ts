import { clearAll } from '@/services/clear-all';
import { discoverAllOrigins } from '@/services/origin-discovery';
import { ensurePermissions, checkExistingPermissions } from '@/services/permission-manager';
import { showBadge } from '@/utils/badge';

let cachedPrivateIpOrigins: string[] = [];

export default defineBackground(() => {
  chrome.action.onClicked.addListener(async () => {
    try {
      // Step 1: Request permissions for previously discovered private IPs.
      // This MUST be the first await to preserve the user gesture context
      // required by chrome.permissions.request().
      const preGranted = await ensurePermissions(cachedPrivateIpOrigins);

      // Step 2: Discover all origins (gesture may be lost after this point)
      const { localhostOrigins, privateIpOrigins } = await discoverAllOrigins();

      // Step 3: For newly discovered IPs not in cache, only check existing
      // permissions (no request — gesture is already consumed)
      const newIps = privateIpOrigins.filter((ip) => !cachedPrivateIpOrigins.includes(ip));
      let newGranted: string[] = [];
      if (newIps.length > 0) {
        const newPermResult = await checkExistingPermissions(newIps);
        newGranted = newPermResult.granted;
      }

      // Step 4: Merge all granted private IP origins
      const allGrantedPrivateIps = [...new Set([...preGranted.granted, ...newGranted])];
      const allDeniedCount = preGranted.denied.length + (newIps.length - newGranted.length);

      // Step 5: Update cache for next click
      cachedPrivateIpOrigins = privateIpOrigins;

      // Step 6: Clear data
      const result = await clearAll(localhostOrigins, allGrantedPrivateIps);

      // Step 7: Show badge
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
