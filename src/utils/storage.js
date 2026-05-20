// ── localStorage helpers ──────────────────────────────────────────
export function saveSettings(settings) {
  try {
    localStorage.setItem("lekha-settings", JSON.stringify(settings));
  } catch (err) {
    console.warn("Could not save settings:", err);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem("lekha-settings");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── IndexedDB helpers ─────────────────────────────────────────────
const DB_NAME = "lekha-db";
const DB_VERSION = 1;
const BOOKS_STORE = "books";
const PROGRESS_STORE = "progress";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function saveBook(id, file, metadata) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, "readwrite");
    const store = tx.objectStore(BOOKS_STORE);
    const req = store.put({
      id,
      file,
      title: metadata.title,
      creator: metadata.creator,
      wordCount: metadata.wordCount || 0,
      chapterCount: metadata.chapterCount || 0,
      savedAt: Date.now(),
    });
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function loadAllBooks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, "readonly");
    const store = tx.objectStore(BOOKS_STORE);
    const req = store.getAll();
    req.onsuccess = (e) => {
      const books = e.target.result.map(
        ({ id, title, creator, wordCount, chapterCount, savedAt }) => ({
          id,
          title,
          creator,
          wordCount,
          chapterCount,
          savedAt,
        }),
      );
      resolve(books);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function loadBook(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, "readonly");
    const store = tx.objectStore(BOOKS_STORE);
    const req = store.get(id);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteBook(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, "readwrite");
    const store = tx.objectStore(BOOKS_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function saveProgress(bookId, chapterIndex, wordIndex) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, "readwrite");
    const store = tx.objectStore(PROGRESS_STORE);
    const req = store.put({
      id: bookId,
      chapterIndex,
      wordIndex,
      updatedAt: Date.now(),
    });
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function loadProgress(bookId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, "readonly");
    const store = tx.objectStore(PROGRESS_STORE);
    const req = store.get(bookId);
    req.onsuccess = (e) => resolve(e.target.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteProgress(bookId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, "readwrite");
    const store = tx.objectStore(PROGRESS_STORE);
    const req = store.delete(bookId);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}
