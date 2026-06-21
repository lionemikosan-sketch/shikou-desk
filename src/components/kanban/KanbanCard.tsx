import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CalendarDays, ListTree } from 'lucide-react';
import type { Card } from '@/types';
import { PRIORITY_META, TYPE_META } from '@/lib/constants';
import { formatDueDate } from '@/lib/date';
import { useUI } from '@/store/useUI';

interface KanbanCardProps {
  card: Card;
  /** 子カードの件数（サブタスク） */
  childCount?: number;
  /** ドラッグ中のオーバーレイ表示か */
  overlay?: boolean;
}

/** カンバン上のカード。種類ごとに左ボーダーの色を変える。並べ替え対応。 */
export function KanbanCard({ card, childCount = 0, overlay = false }: KanbanCardProps) {
  const openEditCard = useUI((s) => s.openEditCard);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { card } });

  const type = TYPE_META[card.type];
  const due = card.dueDate ? formatDueDate(card.dueDate) : null;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      className={`group bg-surface rounded-xl border border-slate-100 border-l-4 ${
        type.accent
      } shadow-soft p-3 ${
        isDragging ? 'opacity-30' : ''
      } ${overlay ? 'shadow-lift rotate-1 cursor-grabbing' : ''}`}
    >
      <div className="flex items-start gap-1.5">
        {/* ドラッグハンドル：タッチでも掴みやすいよう広め */}
        <button
          className="shrink-0 -ml-1 mt-0.5 p-1 text-ink-faint hover:text-ink-soft touch-none cursor-grab active:cursor-grabbing"
          aria-label="ドラッグして移動"
          {...listeners}
          {...attributes}
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={() => openEditCard(card)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm" aria-hidden>
              {type.emoji}
            </span>
            <span className="text-[11px] font-medium text-ink-faint">
              {type.label}
            </span>
            {childCount > 0 && (
              <span className="ml-auto chip bg-surface-sunken text-ink-faint !px-1.5 !py-0">
                <ListTree size={11} /> {childCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium leading-snug break-words line-clamp-3">
            {card.title || '(無題)'}
          </p>

          {(due || card.priority === 'high' || card.tags.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {card.priority === 'high' && (
                <span className={`chip ${PRIORITY_META.high.chip}`}>高</span>
              )}
              {due && (
                <span
                  className={`chip ${
                    due.overdue
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <CalendarDays size={11} /> {due.text}
                </span>
              )}
              {card.tags.slice(0, 2).map((t) => (
                <span key={t} className="chip bg-accent-soft text-accent-ink">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
