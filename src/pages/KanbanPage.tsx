import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { childCounts as computeChildCounts, groupByStatus } from '@/lib/cards';
import { KANBAN_ORDER, CARD_TYPES, TYPE_META } from '@/lib/constants';
import type { Card, CardStatus, CardType } from '@/types';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { KanbanCard } from '@/components/kanban/KanbanCard';

/** prev と next の間に入る並べ替え値を計算する（midpoint方式） */
function computeSort(prev?: Card, next?: Card): number {
  if (prev && next) return (prev.sort + next.sort) / 2;
  if (prev) return prev.sort + 1;
  if (next) return next.sort - 1;
  return Date.now();
}

export function KanbanPage() {
  const cards = useStore((s) => s.cards);
  const reorder = useStore((s) => s.reorder);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [filterTypes, setFilterTypes] = useState<CardType[]>([]);

  const filtered = useMemo(
    () =>
      filterTypes.length === 0
        ? cards
        : cards.filter((c) => filterTypes.includes(c.type)),
    [cards, filterTypes],
  );
  const grouped = useMemo(() => groupByStatus(filtered), [filtered]);
  const childCounts = useMemo(() => computeChildCounts(cards), [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (e: DragStartEvent) => {
    const card = e.active.data.current?.card as Card | undefined;
    if (card) setActiveCard(card);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeC = cards.find((c) => c.id === activeId);
    if (!activeC) return;

    // ドロップ先のステータスを決定（列ID or カードIDのどちらか）
    const overIsColumn = (KANBAN_ORDER as string[]).includes(overId);
    const targetStatus: CardStatus = overIsColumn
      ? (overId as CardStatus)
      : cards.find((c) => c.id === overId)?.status ?? activeC.status;

    // 対象列の表示順（フィルタ後・sort昇順）から、挿入位置を求める
    const column = grouped[targetStatus] ?? [];
    const without = column.filter((c) => c.id !== activeId);

    let index: number;
    if (overIsColumn) {
      index = without.length;
    } else {
      const overIdx = without.findIndex((c) => c.id === overId);
      index = overIdx === -1 ? without.length : overIdx;
      // 同じ列で下方向へ動かすときは over の後ろに入れる
      if (activeC.status === targetStatus) {
        const origIdx = column.findIndex((c) => c.id === activeId);
        if (origIdx !== -1 && origIdx <= overIdx) index = overIdx + 1;
      }
    }

    const prev = without[index - 1];
    const next = without[index];
    const newSort = computeSort(prev, next);

    // 位置もステータスも変わらないなら何もしない
    if (
      activeC.status === targetStatus &&
      Math.abs(activeC.sort - newSort) < 1e-9
    ) {
      return;
    }

    reorder([{ id: activeId, status: targetStatus, sort: newSort }]);
  };

  const toggleType = (t: CardType) =>
    setFilterTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] sm:h-[calc(100vh-7rem)]">
      <div className="mb-3 shrink-0">
        <h1 className="text-2xl font-bold">カンバン</h1>
        <p className="text-sm text-ink-faint mt-1">
          カードを掴んで列の移動や並べ替えができます。スマホは長押しでドラッグ。
        </p>
      </div>

      {/* 種類フィルタ */}
      <div className="shrink-0 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex items-center gap-2 w-max">
          <SlidersHorizontal size={15} className="text-ink-faint shrink-0" />
          {CARD_TYPES.map((t) => {
            const on = filterTypes.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition ${
                  on
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-slate-200 text-ink-soft bg-surface'
                }`}
              >
                <span aria-hidden>{TYPE_META[t].emoji}</span>
                {TYPE_META[t].label}
              </button>
            );
          })}
          {filterTypes.length > 0 && (
            <button
              onClick={() => setFilterTypes([])}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-ink-faint hover:text-ink whitespace-nowrap"
            >
              <X size={13} /> 解除
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveCard(null)}
      >
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-3 h-full pb-2">
            {KANBAN_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                cards={grouped[status] ?? []}
                childCounts={childCounts}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div className="w-72">
              <KanbanCard card={activeCard} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
