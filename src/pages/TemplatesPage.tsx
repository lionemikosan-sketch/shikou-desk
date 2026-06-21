import { ArrowRight } from 'lucide-react';
import { TEMPLATES, cardInputFromTemplate, type Template } from '@/lib/templates';
import { useUI } from '@/store/useUI';

export function TemplatesPage() {
  const openNewCard = useUI((s) => s.openNewCard);

  const use = (t: Template) => {
    // テンプレートの内容を入れた新規カードをエディタで開く
    openNewCard(cardInputFromTemplate(t));
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">テンプレート</h1>
        <p className="text-sm text-ink-faint mt-1">
          考えがまとまらないときは、質問に答えるだけ。選ぶとカードになります。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => use(t)}
            className="card-surface text-left p-4 hover:shadow-lift transition-shadow group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">{t.emoji}</span>
              <span className="font-semibold text-[15px]">{t.name}</span>
              <ArrowRight
                size={18}
                className="ml-auto text-ink-faint group-hover:text-accent-ink group-hover:translate-x-0.5 transition"
              />
            </div>
            <p className="text-sm text-ink-soft mb-3">{t.description}</p>
            <ul className="space-y-1">
              {t.questions.slice(0, 4).map((q) => (
                <li
                  key={q}
                  className="text-xs text-ink-faint flex items-center gap-1.5"
                >
                  <span className="h-1 w-1 rounded-full bg-ink-faint" />
                  {q}
                </li>
              ))}
              {t.questions.length > 4 && (
                <li className="text-xs text-ink-faint pl-2.5">
                  ほか {t.questions.length - 4} 項目…
                </li>
              )}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}
