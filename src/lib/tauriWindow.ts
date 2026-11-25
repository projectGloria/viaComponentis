import { getCurrentWindow } from '@tauri-apps/api/window';

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function minimizeWindow(): Promise<void> {
  if (!isTauriRuntime()) return;
  await getCurrentWindow().minimize();
}

export async function toggleMaximizeWindow(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  const win = getCurrentWindow();
  await win.toggleMaximize();
  return win.isMaximized();
}

export async function closeWindow(): Promise<void> {
  if (!isTauriRuntime()) return;
  await getCurrentWindow().close();
}

export async function isWindowMaximized(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  return getCurrentWindow().isMaximized();
}

export async function onWindowResized(callback: (maximized: boolean) => void): Promise<() => void> {
  if (!isTauriRuntime()) return () => {};
  const win = getCurrentWindow();
  const unlisten = await win.onResized(async () => {
    try {
      callback(await win.isMaximized());
    } catch {
      // Ignore transient resize checks during teardown
    }
  });
  return unlisten;
}
