import { openUrl } from '@tauri-apps/plugin-opener';
import { isTauriRuntime } from './tauriWindow';

export async function openExternalUrl(url: string): Promise<void> {
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    return;
  }
  if (isTauriRuntime()) {
    try {
      await openUrl(url);
      return;
    } catch {
      // Fall back to window.open if opener fails
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
