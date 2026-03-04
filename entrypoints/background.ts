import { clearAll } from '@/services/clear-all';
import { showBadge } from '@/utils/badge';

export default defineBackground(() => {
  chrome.action.onClicked.addListener(async () => {
    try {
      const result = await clearAll();
      if (result.success) {
        await showBadge('success');
      } else {
        console.error('Clear localhost errors:', result.errors);
        await showBadge('error');
      }
    } catch (error) {
      console.error('Unhandled error:', error);
      await showBadge('error');
    }
  });
});
