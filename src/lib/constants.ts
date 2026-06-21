import type {
  CardStatus,
  CardType,
  EdgeType,
  Priority,
} from '@/types';

// ============================================================
// 表示用のラベル・色・アイコン定義
// ============================================================

export interface TypeMeta {
  label: string;
  emoji: string;
  /** カードのアクセント（左ボーダー等）に使う色クラス */
  accent: string;
  /** チップ用の背景・文字色 */
  chip: string;
}

export const TYPE_META: Record<CardType, TypeMeta> = {
  todo: { label: 'TODO', emoji: '✅', accent: 'border-l-emerald-400', chip: 'bg-emerald-50 text-emerald-700' },
  idea: { label: 'アイデア', emoji: '💡', accent: 'border-l-amber-400', chip: 'bg-amber-50 text-amber-700' },
  worry: { label: '悩み', emoji: '🌧️', accent: 'border-l-sky-400', chip: 'bg-sky-50 text-sky-700' },
  memo: { label: 'メモ', emoji: '📝', accent: 'border-l-slate-300', chip: 'bg-slate-100 text-slate-600' },
  shopping: { label: '買い物', emoji: '🛒', accent: 'border-l-rose-400', chip: 'bg-rose-50 text-rose-700' },
  project: { label: 'プロジェクト', emoji: '📁', accent: 'border-l-indigo-400', chip: 'bg-indigo-50 text-indigo-700' },
  person: { label: '人', emoji: '🧑', accent: 'border-l-teal-400', chip: 'bg-teal-50 text-teal-700' },
  hold: { label: '保留', emoji: '⏸️', accent: 'border-l-zinc-300', chip: 'bg-zinc-100 text-zinc-600' },
};

export const CARD_TYPES = Object.keys(TYPE_META) as CardType[];

export interface StatusMeta {
  label: string;
  /** カンバンの列ヘッダー等に使う色 */
  tint: string;
  dot: string;
}

export const STATUS_META: Record<CardStatus, StatusMeta> = {
  inbox: { label: '受信箱', tint: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  today: { label: '今日', tint: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500' },
  thisWeek: { label: '今週', tint: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  doing: { label: '作業中', tint: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  waiting: { label: '保留', tint: 'bg-zinc-100 text-zinc-600', dot: 'bg-zinc-400' },
  done: { label: '完了', tint: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
};

/** カンバンの列の並び順 */
export const KANBAN_ORDER: CardStatus[] = [
  'inbox',
  'today',
  'thisWeek',
  'doing',
  'waiting',
  'done',
];

export interface PriorityMeta {
  label: string;
  chip: string;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  low: { label: '低', chip: 'bg-slate-100 text-slate-500' },
  medium: { label: '中', chip: 'bg-sky-50 text-sky-600' },
  high: { label: '高', chip: 'bg-rose-50 text-rose-600' },
};

export const PRIORITIES = Object.keys(PRIORITY_META) as Priority[];

export interface EdgeMeta {
  label: string;
  /** 線の色 */
  color: string;
}

export const EDGE_META: Record<EdgeType, EdgeMeta> = {
  relation: { label: '関係あり', color: '#94a3b8' },
  cause: { label: '原因', color: '#f59e0b' },
  effect: { label: '結果', color: '#10b981' },
  need: { label: '必要', color: '#ef4444' },
  reference: { label: '参考', color: '#0ea5e9' },
  idea: { label: 'アイデア', color: '#eab308' },
  todo: { label: 'TODO', color: '#6366f1' },
  hold: { label: '保留', color: '#a1a1aa' },
};

export const EDGE_TYPES = Object.keys(EDGE_META) as EdgeType[];
