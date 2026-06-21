import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Card, CardEdge } from '@/types';

// ============================================================
// IndexedDB 永続化レイヤー
// ストアへの読み書きをここに集約する（保存処理の分離）。
// ============================================================

const DB_NAME = 'shikou-desk';
const DB_VERSION = 1;

interface ShikouDeskDB extends DBSchema {
  cards: {
    key: string;
    value: Card;
    indexes: {
      'by-status': string;
      'by-updatedAt': string;
    };
  };
  edges: {
    key: string;
    value: CardEdge;
  };
}

let dbPromise: Promise<IDBPDatabase<ShikouDeskDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ShikouDeskDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ShikouDeskDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cards')) {
          const cards = db.createObjectStore('cards', { keyPath: 'id' });
          cards.createIndex('by-status', 'status');
          cards.createIndex('by-updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('edges')) {
          db.createObjectStore('edges', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ---- 読み込み ----

export async function loadAll(): Promise<{ cards: Card[]; edges: CardEdge[] }> {
  const db = await getDB();
  const [cards, edges] = await Promise.all([
    db.getAll('cards'),
    db.getAll('edges'),
  ]);
  return { cards, edges };
}

// ---- カード ----

export async function putCard(card: Card): Promise<void> {
  const db = await getDB();
  await db.put('cards', card);
}

export async function putCards(cards: Card[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('cards', 'readwrite');
  await Promise.all(cards.map((c) => tx.store.put(c)));
  await tx.done;
}

export async function deleteCard(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cards', id);
}

// ---- 接続線 ----

export async function putEdge(edge: CardEdge): Promise<void> {
  const db = await getDB();
  await db.put('edges', edge);
}

export async function deleteEdge(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('edges', id);
}

export async function deleteEdges(ids: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('edges', 'readwrite');
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
}

// ---- バックアップ（全置換） ----

export async function replaceAll(
  cards: Card[],
  edges: CardEdge[],
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['cards', 'edges'], 'readwrite');
  await tx.objectStore('cards').clear();
  await tx.objectStore('edges').clear();
  await Promise.all([
    ...cards.map((c) => tx.objectStore('cards').put(c)),
    ...edges.map((e) => tx.objectStore('edges').put(e)),
  ]);
  await tx.done;
}
