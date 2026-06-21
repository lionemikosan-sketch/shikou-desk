import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Card, CardStatus } from '@/types';
import { STATUS_META } from '@/lib/constants';
import { useUI } from '@/store/useUI';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: CardStatus;
  cards: Card[];
  childCounts: Map<string, number>;
}

export function KanbanColumn({ status, cards, childCounts }: KanbanColumnProps) {
  const openNewCard = useUI((s) => s.openNewCard);
  const meta = STATUS_META[status];
  // 列全体をドロップ対象にする（空の列や末尾へのドロップ用）
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-[78vw] sm:w-72 shrink-0 max-h-full">
      <div className="flex items-center gap-2 px-1 mb-2">
        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
        <h3 className="font-semibold text-sm">{meta.label}</h3>
        <span className="chip bg-surface-sunken text-ink-faint">
          {cards.length}
        </span>
        <button
          onClick={() => openNewCard({ title: '', status })}
          className="ml-auto p-1 text-ink-faint hover:text-accent-ink rounded-lg hover:bg-surface-sunken"
          aria-label={`${meta.label}に追加`}
        >
          <Plus size={17} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto rounded-2xl p-2 space-y-2 transition-colors min-h-[120px] ${
          isOver
            ? 'bg-accent-soft ring-2 ring-accent/30'
            : 'bg-surface-sunken/60'
        }`}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.length === 0 ? (
            <div className="h-24 grid place-items-center text-xs text-ink-faint">
              ここにドラッグ
            </div>
          ) : (
            cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                childCount={childCounts.get(card.id) ?? 0}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
