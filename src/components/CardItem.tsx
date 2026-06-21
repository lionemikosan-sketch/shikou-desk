import type { ReactNode } from 'react';
import { CalendarDays, ListTree } from 'lucide-react';
import type { Card } from '@/types';
import { PRIORITY_META, STATUS_META, TYPE_META } from '@/lib/constants';
import { formatRelative, formatDueDate } from '@/lib/date';
import { useUI } from '@/store/useUI';
import { useStore } from '@/store/useStore';

interface CardItemProps {
  card: Card;
  /** 操作ボタンなどを下部に差し込む */
  actions?: ReactNode;
  /** ステータスのバッジを表示する */
  showStatus?: boolean;
}

/** リスト表示用のカード。クリックで編集モーダルを開く。 */
export function CardItem({ card, actions, showStatus = false }: CardItemProps) {
  const openEditCard = useUI((s) => s.openEditCard);
  const childCount = useStore(
    (s) => s.cards.filter((c) => c.parentId === card.id && !c.isArchived).length,
  );
  const type = TYPE_META[card.type];
  const due = card.dueDate ? formatDueDate(card.dueDate) : null;

  return (
    <div
      className={`card-surface border-l-4 ${type.accent} p-3.5 hover:shadow-lift
        transition-shadow animate-fade-in`}
    >
      <button
        type="button"
        onClick={() => openEditCard(card)}
        className="block w-full text-left"
      >
        <div className="flex items-start gap-2">
          <span className="text-base leading-6 shrink-0" aria-hidden>
            {type.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[15px] leading-snug break-words">
              {card.title || '(無題)'}
            </p>
            {card.body && (
              <p className="mt-1 text-sm text-ink-soft line-clamp-2 whitespace-pre-wrap break-words">
                {card.body}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pl-7">
          {showStatus && (
            <span className={`chip ${STATUS_META[card.status].tint}`}>
              {STATUS_META[card.status].label}
            </span>
          )}
          {card.priority === 'high' && (
            <span className={`chip ${PRIORITY_META.high.chip}`}>優先度 高</span>
          )}
          {childCount > 0 && (
            <span className="chip bg-surface-sunken text-ink-faint">
              <ListTree size={12} /> {childCount}
            </span>
          )}
          {due && (
            <span
              className={`chip ${
                due.overdue
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CalendarDays size={12} /> {due.text}
            </span>
          )}
          {card.tags.map((t) => (
            <span key={t} className="chip bg-accent-soft text-accent-ink">
              #{t}
            </span>
          ))}
          <span className="text-xs text-ink-faint ml-auto pl-2">
            {formatRelative(card.updatedAt)}
          </span>
        </div>
      </button>

      {actions && (
        <div className="mt-3 pl-7 flex flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}
