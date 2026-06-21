import { useMemo, useState } from 'react';
import { Pencil, Trash2, Sun, CalendarRange, Pause, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { inboxCards } from '@/lib/cards';
import type { Card, CardStatus } from '@/types';
import { QuickCapture } from '@/components/QuickCapture';
import { CardItem } from '@/components/CardItem';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function InboxPage() {
  const cards = useStore((s) => s.cards);
  const setStatus = useStore((s) => s.setStatus);
  const deleteCard = useStore((s) => s.deleteCard);
  const openEditCard = useUI((s) => s.openEditCard);

  const inbox = useMemo(() => inboxCards(cards), [cards]);
  const [pendingDelete, setPendingDelete] = useState<Card | null>(null);

  const move = (id: string, status: CardStatus) => setStatus(id, status);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">受信箱</h1>
        <p className="text-sm text-ink-faint mt-1">
          ひとつずつ、行き先を決めていきましょう。完璧でなくて大丈夫。
        </p>
      </div>

      <QuickCapture placeholder="ここでも追加できます…" />

      <div className="mt-6">
        {inbox.length === 0 ? (
          <EmptyState
            emoji="✨"
            title="受信箱はすべて片付きました"
            description="新しく思いついたことがあれば、いつでも書き出してください。"
          />
        ) : (
          <div className="space-y-2.5">
            {inbox.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                actions={
                  <>
                    <ActionBtn
                      icon={<Sun size={15} />}
                      label="今日へ"
                      onClick={() => move(card.id, 'today')}
                    />
                    <ActionBtn
                      icon={<CalendarRange size={15} />}
                      label="今週へ"
                      onClick={() => move(card.id, 'thisWeek')}
                    />
                    <ActionBtn
                      icon={<Pause size={15} />}
                      label="保留へ"
                      onClick={() => move(card.id, 'waiting')}
                    />
                    <ActionBtn
                      icon={<Check size={15} />}
                      label="完了へ"
                      onClick={() => move(card.id, 'done')}
                    />
                    <ActionBtn
                      icon={<Pencil size={15} />}
                      label="編集"
                      onClick={() => openEditCard(card)}
                    />
                    <ActionBtn
                      icon={<Trash2 size={15} />}
                      label="削除"
                      danger
                      onClick={() => setPendingDelete(card)}
                    />
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="このカードを削除しますか？"
        message={pendingDelete?.title}
        confirmLabel="削除する"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteCard(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function ActionBtn({ icon, label, onClick, danger }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`btn px-3 py-2 text-sm border ${
        danger
          ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100'
          : 'border-slate-200 bg-surface text-ink-soft hover:bg-surface-sunken'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
