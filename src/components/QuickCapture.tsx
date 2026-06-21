import { useRef, useState, type KeyboardEvent } from 'react';
import { Plus, CornerDownLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface QuickCaptureProps {
  /** 追加先のステータス（既定は受信箱） */
  status?: 'inbox' | 'today';
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * トップの大きなクイック入力欄。
 * 「整理する前に、まず全部出せる」ための中心的な入り口。
 */
export function QuickCapture({
  status = 'inbox',
  placeholder = '頭の中にあること、何でも書き出す…',
  autoFocus = false,
}: QuickCaptureProps) {
  const addCard = useStore((s) => s.addCard);
  const [value, setValue] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    // 1行目をタイトル、残りを本文にする
    const [first, ...rest] = text.split('\n');
    addCard({
      title: first.trim() || text.slice(0, 40),
      body: rest.join('\n').trim(),
      type: 'memo',
      status,
    });
    setValue('');
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
    ref.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enterで追加 / Shift+Enterで改行
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="card-surface p-3 sm:p-4">
      <textarea
        ref={ref}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none bg-transparent outline-none text-lg sm:text-xl
          leading-relaxed placeholder:text-ink-faint px-1.5 py-1"
      />
      <div className="flex items-center justify-between mt-1 pl-1.5">
        <p className="text-xs text-ink-faint flex items-center gap-1">
          {justAdded ? (
            <span className="text-emerald-600 font-medium animate-fade-in">
              受信箱に追加しました ✓
            </span>
          ) : (
            <>
              <CornerDownLeft size={13} /> Enterで追加 ・ Shift+Enterで改行
            </>
          )}
        </p>
        <button
          className="btn-primary px-5 py-2.5 text-[15px]"
          onClick={submit}
          disabled={!value.trim()}
        >
          <Plus size={18} /> カードを追加
        </button>
      </div>
    </div>
  );
}
