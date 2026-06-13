import { PhotoEntry } from '../types';

const DB_NAME = 'tooensure-photos';
const DB_VERSION = 1;
const STORE = 'photos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhotos(stopId: string, photos: PhotoEntry[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  // Delete old photos for this stop first
  const all: IDBRequest<IDBCursorWithValue | null> = store.openCursor();
  await new Promise<void>((res) => {
    all.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result as IDBCursorWithValue | null;
      if (cursor) {
        if ((cursor.value as { stopId: string }).stopId === stopId) cursor.delete();
        cursor.continue();
      } else res();
    };
    all.onerror = () => res();
  });
  for (const photo of photos) {
    store.put({ ...photo, stopId });
  }
  await new Promise<void>((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}

export async function loadPhotos(stopId: string): Promise<PhotoEntry[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const store = tx.objectStore(STORE);
  const results: PhotoEntry[] = [];
  await new Promise<void>((res) => {
    const cursor = store.openCursor();
    cursor.onsuccess = (e) => {
      const c = (e.target as IDBRequest).result as IDBCursorWithValue | null;
      if (c) {
        if (c.value.stopId === stopId) {
          const { stopId: _sid, ...photo } = c.value;
          results.push(photo as PhotoEntry);
        }
        c.continue();
      } else res();
    };
    cursor.onerror = () => res();
  });
  db.close();
  return results.sort((a, b) => a.ts - b.ts);
}

export async function deleteStopPhotos(stopId: string): Promise<void> {
  await savePhotos(stopId, []);
}

export async function compressPhoto(file: File): Promise<PhotoEntry> {
  const MAX_DIM = 1200;
  const THUMB_DIM = 200;
  const QUALITY = 0.78;

  const readFile = (): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(reader.error);
      reader.readAsDataURL(file);
    });

  const original = await readFile();

  const compress = (src: string, maxDim: number, quality: number): Promise<string> =>
    new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { res(src); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const result = canvas.toDataURL('image/jpeg', quality);
        res(result.length > 100 ? result : src);
      };
      img.onerror = () => res(src);
      img.src = src;
    });

  const [dataUrl, thumb] = await Promise.all([
    compress(original, MAX_DIM, QUALITY),
    compress(original, THUMB_DIM, 0.65),
  ]);

  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dataUrl,
    thumb,
    name: file.name,
    size: file.size,
    capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ts: Date.now(),
  };
}
