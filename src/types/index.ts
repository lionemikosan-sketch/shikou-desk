// ============================================================
// 思考デスク - データ型定義
// ============================================================

/** カードの種類 */
export type CardType =
  | 'todo'
  | 'idea'
  | 'worry'
  | 'memo'
  | 'shopping'
  | 'project'
  | 'person'
  | 'hold';

/** カードのステータス（カンバンの列に対応） */
export type CardStatus =
  | 'inbox'
  | 'today'
  | 'thisWeek'
  | 'doing'
  | 'waiting'
  | 'done';

/** 優先度 */
export type Priority = 'low' | 'medium' | 'high';

/** カード */
export interface Card {
  id: string;
  title: string;
  body: string;
  type: CardType;
  status: CardStatus;
  tags: string[];
  priority: Priority;
  /** 期限（ISO日付文字列 "YYYY-MM-DD" / 未設定は null） */
  dueDate: string | null;
  /** 作成日時（ISO文字列） */
  createdAt: string;
  /** 更新日時（ISO文字列） */
  updatedAt: string;
  /** 親カードID（サブタスクのグループ化など / 無い場合は null） */
  parentId: string | null;
  /** アーカイブ済みか */
  isArchived: boolean;
  /** 同一ステータス列内での手動並べ替え順（小さいほど上） */
  sort: number;
  /** マインドマップ上の座標（未配置は null） */
  position?: { x: number; y: number } | null;
}

/** 接続線（マインドマップのエッジ）の種類 */
export type EdgeType =
  | 'relation'
  | 'cause'
  | 'effect'
  | 'need'
  | 'reference'
  | 'idea'
  | 'todo'
  | 'hold';

/** 接続線 */
export interface CardEdge {
  id: string;
  sourceCardId: string;
  targetCardId: string;
  /** 表示ラベル */
  label: string;
  type: EdgeType;
  createdAt: string;
}

/** JSONバックアップのスキーマ */
export interface BackupData {
  app: 'shikou-desk';
  version: number;
  exportedAt: string;
  cards: Card[];
  edges: CardEdge[];
}

/** 新規カード作成時の入力（任意項目はデフォルトで補完される） */
export type NewCardInput = Partial<
  Omit<Card, 'id' | 'createdAt' | 'updatedAt'>
> & {
  title: string;
};
