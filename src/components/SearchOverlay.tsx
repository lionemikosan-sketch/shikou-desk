import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { collectTags, filterCards } from '@/lib/cards';
import { CardItem } from './CardItem';
import { EmptyState } from './common/EmptyState';
import { Modal } from './common/Modal';

/** カード検索 + タグ絞り込みのオーバーレイ */
export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const close = useUI((s) => s.closeSearch);
  const cards = useStore((s) => s.cards);

  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const allTags = useMemo(() => collectTags(cards), [cards]);
  const results = useMemo(
    () => filterCards(cards, { query, tags }),
    [cards, query, tags],
  );

  const toggleTag = (t: string) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const reset = () => {
    setQuery('');
    setTags([]);
  };

  const active = query.trim().length > 0 || tags.length > 0;

  return (
    <Modal open={open} onClose={close} size="lg" title="検索">
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・本文・タグから探す"
            className="input-base pl-10 pr-10 text-[15px]"
          />
          {active && (
            <button
              onClick={reset}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink"
              aria-label="クリア"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`chip transition ${
                  tags.includes(tag)
                    ? 'bg-accent text-white'
                    : 'bg-surface-sunken text-ink-soft hover:bg-slate-200'
                }`}
              >
                #{tag}
                <span className="opacity-60">{count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 pt-3">
          {!active ? (
            <p className="text-sm text-ink-faint text-center py-8">
              キーワードを入力するか、タグを選んでください。
            </p>
          ) : results.length === 0 ? (
            <EmptyState
              compact
              emoji="🔍"
              title="見つかりませんでした"
              description="別のキーワードやタグで試してみてください。"
            />
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs text-ink-faint px-1">{results.length} 件</p>
              {results.map((c) => (
                <CardItem key={c.id} card={c} showStatus />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
