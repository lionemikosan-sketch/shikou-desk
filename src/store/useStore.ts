import { create } from 'zustand';
import type {
  Card,
  CardEdge,
  CardStatus,
  EdgeType,
  NewCardInput,
} from '@/types';
import { uid } from '@/lib/id';
import * as db from '@/db/db';

// ============================================================
// Zustand ストア
// 画面はすべてこのストア経由でデータを読み書きする。
// すべての変更は即座に IndexedDB へ保存される（自動保存）。
// ============================================================

interface StoreState {
  cards: Card[];
  edges: CardEdge[];
  loaded: boolean;
  error: string | null;

  /** 起動時に IndexedDB から読み込む */
  init: () => Promise<void>;

  // --- カード操作 ---
  addCard: (input: NewCardInput) => Card;
  addCards: (inputs: NewCardInput[]) => Card[];
  updateCard: (id: string, patch: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  duplicateCard: (id: string) => Card | null;
  setStatus: (id: string, status: CardStatus) => void;
  setCardPosition: (id: string, position: { x: number; y: number }) => void;
  /** カンバンの並べ替え：複数カードの status/sort をまとめて更新（updatedAtは変えない） */
  reorder: (updates: { id: string; status?: CardStatus; sort: number }[]) => void;

  // --- 接続線操作 ---
  addEdge: (
    sourceCardId: string,
    targetCardId: string,
    type: EdgeType,
  ) => CardEdge | null;
  updateEdge: (id: string, patch: Partial<CardEdge>) => void;
  deleteEdge: (id: string) => void;

  // --- バックアップ ---
  importData: (cards: Card[], edges: CardEdge[]) => Promise<void>;
}

function now(): string {
  return new Date().toISOString();
}

/** NewCardInput からデフォルト値を補完した完全な Card を生成する */
function buildCard(input: NewCardInput): Card {
  const ts = now();
  return {
    id: uid(),
    title: input.title.trim(),
    body: input.body ?? '',
    type: input.type ?? 'memo',
    status: input.status ?? 'inbox',
    tags: input.tags ?? [],
    priority: input.priority ?? 'medium',
    dueDate: input.dueDate ?? null,
    createdAt: ts,
    updatedAt: ts,
    parentId: input.parentId ?? null,
    isArchived: input.isArchived ?? false,
    sort: input.sort ?? Date.now(),
    position: input.position ?? null,
  };
}

/** 保存失敗時にアプリを壊さず、エラーだけ記録する */
function persist(fn: () => Promise<void>, set: (e: { error: string }) => void) {
  fn().catch((e) => {
    console.error('[shikou-desk] 保存に失敗しました', e);
    set({ error: '保存に失敗しました。ブラウザのストレージを確認してください。' });
  });
}

export const useStore = create<StoreState>((set, get) => ({
  cards: [],
  edges: [],
  loaded: false,
  error: null,

  init: async () => {
    try {
      const { cards, edges } = await db.loadAll();
      set({ cards, edges, loaded: true, error: null });
    } catch (e) {
      console.error('[shikou-desk] 読み込みに失敗しました', e);
      set({
        loaded: true,
        error: 'データの読み込みに失敗しました。',
      });
    }
  },

  addCard: (input) => {
    const card = buildCard(input);
    set((s) => ({ cards: [...s.cards, card] }));
    persist(() => db.putCard(card), set);
    return card;
  },

  addCards: (inputs) => {
    const created = inputs.map(buildCard);
    set((s) => ({ cards: [...s.cards, ...created] }));
    persist(() => db.putCards(created), set);
    return created;
  },

  updateCard: (id, patch) => {
    let updated: Card | undefined;
    set((s) => ({
      cards: s.cards.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...patch, id: c.id, updatedAt: now() };
        return updated;
      }),
    }));
    if (updated) persist(() => db.putCard(updated as Card), set);
  },

  deleteCard: (id) => {
    const removedEdgeIds = get()
      .edges.filter((e) => e.sourceCardId === id || e.targetCardId === id)
      .map((e) => e.id);
    set((s) => ({
      cards: s.cards.filter((c) => c.id !== id),
      edges: s.edges.filter(
        (e) => e.sourceCardId !== id && e.targetCardId !== id,
      ),
    }));
    persist(async () => {
      await db.deleteCard(id);
      if (removedEdgeIds.length) await db.deleteEdges(removedEdgeIds);
    }, set);
  },

  duplicateCard: (id) => {
    const src = get().cards.find((c) => c.id === id);
    if (!src) return null;
    const ts = now();
    const copy: Card = {
      ...src,
      id: uid(),
      title: src.title ? `${src.title}（コピー）` : 'コピー',
      createdAt: ts,
      updatedAt: ts,
      sort: src.sort + 1,
      position: src.position
        ? { x: src.position.x + 32, y: src.position.y + 32 }
        : null,
    };
    set((s) => ({ cards: [...s.cards, copy] }));
    persist(() => db.putCard(copy), set);
    return copy;
  },

  setStatus: (id, status) => {
    get().updateCard(id, { status });
  },

  reorder: (updates) => {
    const map = new Map(updates.map((u) => [u.id, u]));
    const changed: Card[] = [];
    set((s) => ({
      cards: s.cards.map((c) => {
        const u = map.get(c.id);
        if (!u) return c;
        const next: Card = {
          ...c,
          sort: u.sort,
          status: u.status ?? c.status,
        };
        changed.push(next);
        return next;
      }),
    }));
    if (changed.length) persist(() => db.putCards(changed), set);
  },

  setCardPosition: (id, position) => {
    let updated: Card | undefined;
    set((s) => ({
      cards: s.cards.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, position };
        return updated;
      }),
    }));
    // 位置だけの変更は updatedAt を更新しない（並べ替えに影響させない）
    if (updated) persist(() => db.putCard(updated as Card), set);
  },

  addEdge: (sourceCardId, targetCardId, type) => {
    if (sourceCardId === targetCardId) return null;
    // 同じ向きの重複は作らない
    const exists = get().edges.some(
      (e) => e.sourceCardId === sourceCardId && e.targetCardId === targetCardId,
    );
    if (exists) return null;

    const edge: CardEdge = {
      id: uid(),
      sourceCardId,
      targetCardId,
      label: '',
      type,
      createdAt: now(),
    };
    set((s) => ({ edges: [...s.edges, edge] }));
    persist(() => db.putEdge(edge), set);
    return edge;
  },

  updateEdge: (id, patch) => {
    let updated: CardEdge | undefined;
    set((s) => ({
      edges: s.edges.map((e) => {
        if (e.id !== id) return e;
        updated = { ...e, ...patch, id: e.id };
        return updated;
      }),
    }));
    if (updated) persist(() => db.putEdge(updated as CardEdge), set);
  },

  deleteEdge: (id) => {
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }));
    persist(() => db.deleteEdge(id), set);
  },

  importData: async (cards, edges) => {
    await db.replaceAll(cards, edges);
    set({ cards, edges, error: null });
  },
}));
