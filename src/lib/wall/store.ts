import { MAX_MARKS, type Mark } from "./marks";

/**
 * Where the wall is kept: IndexedDB, in this browser, and nowhere else.
 *
 * Nothing is sent anywhere. Each mark is one record in one object store,
 * keyed by a number IndexedDB counts up itself, with an index on when it was
 * made so the wall comes back oldest first, which is the order it is painted
 * in. Strokes keep their points as a Uint16Array, which IndexedDB stores as
 * it is, as binary: the structured clone algorithm copies typed arrays,
 * where localStorage would only take a string.
 *
 * Spoken to directly rather than through a library: four requests do not
 * need one. docs/THE_WALL.md walks through every line of this.
 */

const DB_NAME = "cave-wall";
const DB_VERSION = 1;
const STORE = "marks";
const BY_AGE = "made";
/** Other tabs of the same site hear about a change to the wall on this. */
const CHANNEL = "cave-wall";

/** An IDBRequest as a promise: IndexedDB predates promises and speaks in events. */
function settle<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** A transaction is only done when it commits, not when its last request succeeds. */
function committed(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new DOMException("Aborted", "AbortError"));
  });
}

let opening: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  opening ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    // Runs the first time, and whenever DB_VERSION goes up: the only place
    // the shape of the database may change. Each version adds to the last.
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (event.oldVersion < 1) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex(BY_AGE, "made");
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      // A newer version of this page, open in another tab, wants to change
      // the shape: get out of its way, and open again next time.
      db.onversionchange = () => {
        db.close();
        opening = null;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new DOMException("Blocked by an older tab", "InvalidStateError"));
  });
  opening.catch(() => {
    opening = null;
  });
  return opening;
}

export type WallStore = {
  /** Every mark, oldest first. */
  all(): Promise<Mark[]>;
  /** Keeps a mark and returns it with its id. */
  add(mark: Mark): Promise<Mark>;
  /** Washes the wall: every mark gone. */
  wash(): Promise<void>;
  /** Whether marks outlive this page: false when the browser keeps nothing for the site. */
  readonly lasting: boolean;
  /** Called when another tab changes the wall. */
  onChange(listener: () => void): () => void;
  close(): void;
};

/** The wall, kept in IndexedDB; in memory only if the browser will not keep it. */
export async function openWall(): Promise<WallStore> {
  const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL);
  const listeners = new Set<() => void>();
  if (channel) channel.onmessage = () => listeners.forEach((listener) => listener());
  const told = () => channel?.postMessage("changed");
  const onChange = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const close = () => channel?.close();

  let db: IDBDatabase;
  try {
    if (typeof indexedDB === "undefined") throw new Error("No IndexedDB");
    db = await open();
  } catch {
    return inMemory(onChange, close);
  }

  return {
    lasting: true,
    onChange,
    close,

    async all() {
      const tx = db.transaction(STORE, "readonly");
      return settle(tx.objectStore(STORE).index(BY_AGE).getAll() as IDBRequest<Mark[]>);
    },

    async add(mark) {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const { id: _unkept, ...fresh } = mark;
      const id = (await settle(store.add(fresh))) as number;
      // Past the most a wall keeps, the oldest marks wear right off, inside
      // the same transaction, so the wall is never over for a moment.
      const count = await settle(store.count());
      if (count > MAX_MARKS) {
        let extra = count - MAX_MARKS;
        const cursor = store.index(BY_AGE).openCursor();
        await new Promise<void>((resolve, reject) => {
          cursor.onsuccess = () => {
            const at = cursor.result;
            if (!at || extra <= 0) return resolve();
            at.delete();
            extra--;
            at.continue();
          };
          cursor.onerror = () => reject(cursor.error);
        });
      }
      await committed(tx);
      told();
      return { ...fresh, id } as Mark;
    },

    async wash() {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      await committed(tx);
      told();
    },
  };
}

function inMemory(onChange: WallStore["onChange"], close: () => void): WallStore {
  let marks: Mark[] = [];
  let next = 1;
  return {
    lasting: false,
    onChange,
    close,
    async all() {
      return [...marks];
    },
    async add(mark) {
      const kept = { ...mark, id: next++ };
      marks = [...marks, kept].slice(-MAX_MARKS);
      return kept;
    },
    async wash() {
      marks = [];
    },
  };
}

/**
 * Asks the browser to keep the wall even when it is short of space. Left to
 * itself a browser keeps a site's data "best-effort" and may clear it under
 * pressure; persisted, only the visitor can. Chrome and Safari decide
 * quietly; Firefox asks the visitor. So it is asked only once they have made
 * something worth keeping, never on arrival.
 */
export async function askToKeep(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
