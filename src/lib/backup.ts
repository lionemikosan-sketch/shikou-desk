import type { BackupData, Card, CardEdge } from '@/types';

// ============================================================
// JSON バックアップの出力・読み込み
// ============================================================

const BACKUP_VERSION = 1;

export function buildBackup(cards: Card[], edges: CardEdge[]): BackupData {
  return {
    app: 'shikou-desk',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    cards,
    edges,
  };
}

/** バックアップを JSON ファイルとしてダウンロードする */
export function exportBackup(cards: Card[], edges: CardEdge[]): void {
  const data = buildBackup(cards, edges);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `shikou-desk-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // 解放は少し遅らせる
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ParsedBackup {
  cards: Card[];
  edges: CardEdge[];
}

/** 文字列を検証してバックアップとして解釈する。失敗時は例外を投げる。 */
export function parseBackup(text: string): ParsedBackup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('JSONとして読み込めませんでした。');
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('バックアップの形式が正しくありません。');
  }
  const obj = data as Partial<BackupData>;
  if (obj.app !== 'shikou-desk') {
    throw new Error('このアプリのバックアップファイルではありません。');
  }
  if (!Array.isArray(obj.cards) || !Array.isArray(obj.edges)) {
    throw new Error('カードまたは接続線のデータが見つかりません。');
  }

  // 最低限のフィールドだけ検証しつつ、欠けている項目は補完する
  const cards = obj.cards.map(normalizeCard);
  const validIds = new Set(cards.map((c) => c.id));
  const edges = obj.edges
    .map(normalizeEdge)
    .filter(
      (e) => validIds.has(e.sourceCardId) && validIds.has(e.targetCardId),
    );

  return { cards, edges };
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function normalizeCard(raw: unknown): Card {
  const c = (raw ?? {}) as Record<string, unknown>;
  const ts = asString(c.createdAt, new Date().toISOString());
  return {
    id: asString(c.id) || cryptoId(),
    title: asString(c.title, '(無題)'),
    body: asString(c.body),
    type: (asString(c.type, 'memo') as Card['type']),
    status: (asString(c.status, 'inbox') as Card['status']),
    tags: Array.isArray(c.tags)
      ? (c.tags.filter((t) => typeof t === 'string') as string[])
      : [],
    priority: (asString(c.priority, 'medium') as Card['priority']),
    dueDate: typeof c.dueDate === 'string' ? c.dueDate : null,
    createdAt: ts,
    updatedAt: asString(c.updatedAt, ts),
    parentId: typeof c.parentId === 'string' ? c.parentId : null,
    isArchived: c.isArchived === true,
    sort: typeof c.sort === 'number' ? c.sort : Date.parse(ts) || Date.now(),
    position:
      c.position &&
      typeof c.position === 'object' &&
      typeof (c.position as { x?: unknown }).x === 'number'
        ? (c.position as { x: number; y: number })
        : null,
  };
}

function normalizeEdge(raw: unknown): CardEdge {
  const e = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asString(e.id) || cryptoId(),
    sourceCardId: asString(e.sourceCardId),
    targetCardId: asString(e.targetCardId),
    label: asString(e.label),
    type: (asString(e.type, 'relation') as CardEdge['type']),
    createdAt: asString(e.createdAt, new Date().toISOString()),
  };
}

function cryptoId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
