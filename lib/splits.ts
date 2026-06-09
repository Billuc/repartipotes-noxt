const SPLITS_KEY = "splits";
const SEPARATOR = ",";

export function getStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(SPLITS_KEY);
    return raw ? raw.split(SEPARATOR).filter((s) => s.length > 0) : [];
  } catch {
    return [];
  }
}

export function storeId(id: string) {
  const ids = new Set(getStoredIds());
  ids.add(id);
  localStorage.setItem(SPLITS_KEY, Array.from(ids).join(SEPARATOR));
}

export function removeStoredId(id: string) {
  const ids = new Set(getStoredIds());
  ids.delete(id);
  localStorage.setItem(SPLITS_KEY, Array.from(ids).join(SEPARATOR));
}
