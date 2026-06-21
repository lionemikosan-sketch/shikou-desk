import { useMemo } from 'react';
import { Sun, Inbox as InboxIcon, History, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { inboxCards, recentCards, todayCards } from '@/lib/cards';
import { QuickCapture } from '@/components/QuickCapture';
import { CardItem } from '@/components/CardItem';
import { Section } from '@/components/common/Section';
import { EmptyState } from '@/components/common/EmptyState';

export function HomePage() {
  const cards = useStore((s) => s.cards);
  const setRoute = useUI((s) => s.setRoute);

  const today = useMemo(() => todayCards(cards), [cards]);
  const inbox = useMemo(() => inboxCards(cards), [cards]);
  const recent = useMemo(() => recentCards(cards, 6), [cards]);

  const hello = greeting();

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-ink-faint">{hello}</p>
        <h1 className="text-2xl font-bold mt-0.5">今、頭の中にあることは？</h1>
      </div>

      <QuickCapture autoFocus />

      <Section
        title="今日のカード"
        count={today.length}
        icon={<Sun size={18} />}
      >
        {today.length === 0 ? (
          <EmptyState
            compact
            emoji="🌱"
            title="今日のカードはまだありません"
            description="受信箱から「今日へ」を選ぶと、ここに集まります。"
          />
        ) : (
          <div className="space-y-2.5">
            {today.map((c) => (
              <CardItem key={c.id} card={c} showStatus />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="受信箱"
        count={inbox.length}
        icon={<InboxIcon size={18} />}
        action={
          inbox.length > 0 ? (
            <button
              onClick={() => setRoute('inbox')}
              className="btn-ghost text-sm px-2.5 py-1.5 text-accent-ink"
            >
              整理する <ArrowRight size={15} />
            </button>
          ) : undefined
        }
      >
        {inbox.length === 0 ? (
          <EmptyState
            compact
            emoji="📥"
            title="受信箱は空です"
            description="思いついたことを上の入力欄に書き出してみましょう。"
          />
        ) : (
          <div className="space-y-2.5">
            {inbox.slice(0, 5).map((c) => (
              <CardItem key={c.id} card={c} />
            ))}
            {inbox.length > 5 && (
              <button
                onClick={() => setRoute('inbox')}
                className="btn-outline w-full py-2.5 text-sm"
              >
                受信箱の残り {inbox.length - 5} 件を見る
              </button>
            )}
          </div>
        )}
      </Section>

      {recent.length > 0 && (
        <Section
          title="最近編集したカード"
          icon={<History size={18} />}
        >
          <div className="space-y-2.5">
            {recent.map((c) => (
              <CardItem key={c.id} card={c} showStatus />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'こんばんは。夜更かしですね';
  if (h < 11) return 'おはようございます';
  if (h < 18) return 'こんにちは';
  return 'こんばんは';
}
