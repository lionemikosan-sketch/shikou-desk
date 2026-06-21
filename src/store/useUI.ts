import { create } from 'zustand';
import type { Card, NewCardInput } from '@/types';

// ============================================================
// UI状態（どの画面からでもカードエディタを開けるようにする）
// ============================================================

export type Route = 'home' | 'inbox' | 'kanban' | 'mindmap' | 'templates';

interface UIState {
  route: Route;
  setRoute: (route: Route) => void;

  // カードエディタ
  editorOpen: boolean;
  editingCard: Card | null;
  editorSeed: NewCardInput | null;
  openNewCard: (seed?: NewCardInput) => void;
  openEditCard: (card: Card) => void;
  closeEditor: () => void;

  // 検索
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // 設定・バックアップ
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useUI = create<UIState>((set) => ({
  route: 'home',
  setRoute: (route) => set({ route }),

  editorOpen: false,
  editingCard: null,
  editorSeed: null,
  openNewCard: (seed) =>
    set({ editorOpen: true, editingCard: null, editorSeed: seed ?? null }),
  openEditCard: (card) =>
    set({ editorOpen: true, editingCard: card, editorSeed: null }),
  closeEditor: () =>
    set({ editorOpen: false, editingCard: null, editorSeed: null }),

  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
}));
