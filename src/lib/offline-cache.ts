const PREFIX = 'offline-cache:v1:';
const OWNER_KEY = `${PREFIX}owner`;
// Past this wait on a weak signal, the saved copy is shown instead of a spinner.
const SLOW_NETWORK_MS = 4000;
// After one slow answer the following reads skip the wait, so opening the app on a
// weak signal costs one timeout and not one per request.
const SLOW_NETWORK_MEMORY_MS = 30_000;
let slowNetworkUntil = 0;

export function isNetworkError(error: unknown): boolean {
  if (!navigator.onLine) return true;
  const message = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error);
  return /failed to fetch|networkerror|load failed|network request failed/i.test(message);
}

// Answers with fresh data when it arrives in time, and with the saved copy when
// there is no connection. Server rejections are never hidden behind saved data.
export async function preferFreshData<T>(load: () => Promise<T>, saved: { value: T } | null): Promise<T> {
  if (!saved) return load();
  if (!navigator.onLine) return saved.value;
  const fresh = load();
  fresh.catch(() => undefined);
  if (Date.now() < slowNetworkUntil) return saved.value;
  let timer = 0;
  try {
    return await Promise.race([
      fresh,
      new Promise<T>((resolve) => {
        timer = window.setTimeout(() => {
          slowNetworkUntil = Date.now() + SLOW_NETWORK_MEMORY_MS;
          resolve(saved.value);
        }, SLOW_NETWORK_MS);
      }),
    ]);
  } catch (error) {
    if (isNetworkError(error)) return saved.value;
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function readSaved<T>(key: string): { value: T } | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as { value: T }) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify({ value }));
  } catch {
    // Without storage the app keeps working online; only the offline copy is lost.
  }
}

export function withOfflineCache<T>(key: string, load: () => Promise<T>): Promise<T> {
  return preferFreshData(
    () => load().then((value) => { save(key, value); return value; }),
    readSaved<T>(key)
  );
}

// Personal data must never outlive its account on a shared device.
export function setOfflineCacheOwner(userId: string | null): void {
  try {
    if (window.localStorage.getItem(OWNER_KEY) === userId) return;
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
    if (userId) window.localStorage.setItem(OWNER_KEY, userId);
  } catch {
    // Storage disabled: there is nothing saved to protect.
  }
}
