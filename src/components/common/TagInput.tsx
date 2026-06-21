import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = 'タグを追加（Enter）',
}: TagInputProps) {
  const [value, setValue] = useState('');

  const add = (raw: string) => {
    const t = raw.trim().replace(/^#/, '');
    if (!t) return;
    if (!tags.includes(t)) onChange([...tags, t]);
    setValue('');
  };

  const remove = (t: string) => onChange(tags.filter((x) => x !== t));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(value);
    } else if (e.key === 'Backspace' && !value && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };

  const remaining = suggestions
    .filter((s) => !tags.includes(s))
    .filter((s) => (value ? s.includes(value.trim()) : true))
    .slice(0, 6);

  return (
    <div>
      <div className="input-base flex flex-wrap items-center gap-1.5 min-h-[44px]">
        {tags.map((t) => (
          <span key={t} className="chip bg-accent-soft text-accent-ink">
            #{t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="hover:text-rose-500"
              aria-label={`${t} を削除`}
            >
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(value)}
          placeholder={tags.length ? '' : placeholder}
          className="flex-1 min-w-[8ch] bg-transparent outline-none text-sm py-0.5"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="chip bg-surface-sunken text-ink-soft hover:bg-slate-200"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
