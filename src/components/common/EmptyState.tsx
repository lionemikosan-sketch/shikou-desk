import type { ReactNode } from 'react';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** 控えめ表示（リスト内の小さな空状態） */
  compact?: boolean;
}

/** 空データ時の、圧迫感のない案内表示 */
export function EmptyState({
  emoji = '🍵',
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center
        ${compact ? 'py-8' : 'py-16'}`}
    >
      <div className={compact ? 'text-3xl mb-2' : 'text-5xl mb-3'}>{emoji}</div>
      <p className="font-medium text-ink">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-ink-faint max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
