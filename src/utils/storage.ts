export const STORAGE_KEYS = {
  records: "mori_records",
  legacyRecords: "mori_diary_entries",
  user: "mori_user",
  legacyUser: "mori_current_user",
  theme: "mori_theme",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}
