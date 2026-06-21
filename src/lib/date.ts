// ============================================================
// 日付ユーティリティ（すべてローカルタイム基準）
// ============================================================

/** "YYYY-MM-DD" 形式のローカル日付文字列を返す */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO日時がローカルの「今日」に該当するか */
export function isToday(iso: string): boolean {
  return toDateKey(new Date(iso)) === toDateKey();
}

/** 相対的な見やすい表記（例: 3分前 / 昨日 / 6月20日） */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'たった今';
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24 && isToday(iso)) return `${hr}時間前`;

  const d = new Date(iso);
  const todayKey = toDateKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (toDateKey(d) === toDateKey(yesterday)) return '昨日';
  if (toDateKey(d) === todayKey) return '今日';

  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 期限の表示（過ぎている場合のフラグ付き） */
export function formatDueDate(dateKey: string): { text: string; overdue: boolean } {
  const today = toDateKey();
  const overdue = dateKey < today;
  const [, m, d] = dateKey.split('-');
  return { text: `${Number(m)}月${Number(d)}日`, overdue };
}
