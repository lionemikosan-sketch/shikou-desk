import type { Card } from '@/types';
import { isToday } from './date';

// ============================================================
// カード配列に対する純粋な絞り込み・検索ユーティリティ
// ============================================================

/** アーカイブされていないカードだけ */
export function activeCards(cards: Card[]): Card[] {
  return cards.filter((c) => !c.isArchived);
}

/** 更新日時の新しい順 */
export function byUpdatedDesc(a: Card, b: Card): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}

/** 作成日時の新しい順 */
export function byCreatedDesc(a: Card, b: Card): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/** 受信箱のカード（新しい順） */
export function inboxCards(cards: Card[]): Card[] {
  return activeCards(cards)
    .filter((c) => c.status === 'inbox')
    .sort(byCreatedDesc);
}

/** 今日のカード：status が today、または期限が今日、または今日作成されたもの */
export function todayCards(cards: Card[]): Card[] {
  return activeCards(cards)
    .filter(
      (c) =>
        c.status === 'today' ||
        (c.dueDate != null && c.dueDate === todayKey()) ||
        isToday(c.createdAt),
    )
    .sort(byUpdatedDesc);
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 最近編集したカード */
export function recentCards(cards: Card[], limit = 8): Card[] {
  return activeCards(cards).slice().sort(byUpdatedDesc).slice(0, limit);
}

/** すべてのタグを使用数つきで集計（多い順） */
export function collectTags(cards: Card[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const c of activeCards(cards)) {
    for (const t of c.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export interface CardFilter {
  query: string;
  tags: string[];
}

/** テキスト検索 + タグ絞り込み */
export function filterCards(cards: Card[], filter: CardFilter): Card[] {
  const q = filter.query.trim().toLowerCase();
  const tags = filter.tags;
  return activeCards(cards).filter((c) => {
    if (tags.length > 0 && !tags.every((t) => c.tags.includes(t))) {
      return false;
    }
    if (q) {
      const haystack = (
        c.title +
        ' ' +
        c.body +
        ' ' +
        c.tags.join(' ')
      ).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** カンバンの手動並べ替え順（sort 昇順、フォールバックは作成日時） */
export function bySortAsc(a: Card, b: Card): number {
  const sa = a.sort ?? Date.parse(a.createdAt);
  const sb = b.sort ?? Date.parse(b.createdAt);
  if (sa !== sb) return sa - sb;
  return a.createdAt.localeCompare(b.createdAt);
}

/** カンバン用：ステータスごとにグループ化（アーカイブ除外、手動順） */
export function groupByStatus(cards: Card[]): Record<string, Card[]> {
  const groups: Record<string, Card[]> = {};
  for (const c of activeCards(cards)) {
    (groups[c.status] ??= []).push(c);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort(bySortAsc);
  }
  return groups;
}

/** 指定カードの子カード（parentId が一致、新しい順ではなく手動順） */
export function childrenOf(cards: Card[], parentId: string): Card[] {
  return activeCards(cards)
    .filter((c) => c.parentId === parentId)
    .sort(bySortAsc);
}

/** 子カードの件数を親IDごとに集計 */
export function childCounts(cards: Card[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const c of activeCards(cards)) {
    if (c.parentId) map.set(c.parentId, (map.get(c.parentId) ?? 0) + 1);
  }
  return map;
}
