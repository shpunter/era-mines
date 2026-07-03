import { create, type StateCreator } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

// Single shared DB, lazily opened on first use.
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open("eraplanner", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("state");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};

// PersistStorage<unknown> stores { state, version } objects directly —
// IndexedDB handles structured clone natively, no JSON serialization needed.
const idbStorage: PersistStorage<unknown> = {
  getItem: async (name) => {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const req = db
        .transaction("state", "readonly")
        .objectStore("state")
        .get(name);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },

  setItem: async (name, value) => {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put(value, name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  removeItem: async (name) => {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("state", "readwrite");
      tx.objectStore("state").delete(name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};

type WithHydrated<T> = T & { hydrated: boolean };

/**
 * Drop-in replacement for zustand's `create` that automatically persists
 * the entire store to IndexedDB under the given `name` key.
 * Injects `hydrated: boolean` into the store — starts false, flips to true
 * once the IDB read completes. Any component can subscribe to it directly.
 *
 * Usage:
 *   const useMyStore = createIdbStore("my-store", (set) => ({ ... }))
 *   const ready = useMyStore(s => s.hydrated)
 */
export const createIdbStore = <T>(
  name: string,
  stateCreator: StateCreator<T, [], []>,
) => {
  const creator: StateCreator<WithHydrated<T>, [], []> = (set, get, api) => ({
    ...(stateCreator as StateCreator<WithHydrated<T>, [], []>)(set, get, api),
    hydrated: false,
  });

  const store = create<WithHydrated<T>>()(
    persist(creator, {
      name,
      storage: idbStorage as PersistStorage<WithHydrated<T>>,
      // Strip functions (uncloneable) and `hydrated` (always re-derived) from IDB.
      partialize: (state: WithHydrated<T>) =>
        Object.fromEntries(
          Object.entries(state as Record<string, unknown>).filter(
            ([k, v]) => k !== "hydrated" && typeof v !== "function",
          ),
        ) as WithHydrated<T>,
    }),
  );

  store.persist.onFinishHydration(() =>
    store.setState({ hydrated: true } as Partial<WithHydrated<T>>),
  );

  return store;
};
