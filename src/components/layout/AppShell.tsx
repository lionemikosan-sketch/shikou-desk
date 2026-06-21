import type { ReactNode } from 'react';
import {
  Home,
  Inbox,
  Columns3,
  Network,
  LayoutTemplate,
  Plus,
  Search,
  Database,
} from 'lucide-react';
import { useUI, type Route } from '@/store/useUI';
import { useStore } from '@/store/useStore';
import { inboxCards } from '@/lib/cards';

interface NavItem {
  route: Route;
  label: string;
  icon: typeof Home;
}

const NAV: NavItem[] = [
  { route: 'home', label: 'ホーム', icon: Home },
  { route: 'inbox', label: '受信箱', icon: Inbox },
  { route: 'kanban', label: 'カンバン', icon: Columns3 },
  { route: 'mindmap', label: 'マップ', icon: Network },
  { route: 'templates', label: 'テンプレ', icon: LayoutTemplate },
];

export function AppShell({ children }: { children: ReactNode }) {
  const route = useUI((s) => s.route);
  const setRoute = useUI((s) => s.setRoute);
  const openNewCard = useUI((s) => s.openNewCard);
  const openSearch = useUI((s) => s.openSearch);
  const openSettings = useUI((s) => s.openSettings);
  const inboxCount = useStore((s) => inboxCards(s.cards).length);

  return (
    <div className="min-h-screen flex bg-surface-muted">
      {/* デスクトップ：左サイドバー */}
      <aside className="hidden sm:flex sm:flex-col w-60 shrink-0 border-r border-slate-200 bg-surface px-4 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-accent text-white grid place-items-center text-lg shadow-soft">
            🧠
          </div>
          <div>
            <p className="font-semibold leading-tight">思考デスク</p>
            <p className="text-xs text-ink-faint leading-tight">
              まず、全部出す
            </p>
          </div>
        </div>

        <button
          onClick={openSearch}
          className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl text-[15px] font-medium text-ink-soft bg-surface-sunken hover:bg-slate-200 transition-colors"
        >
          <Search size={18} />
          <span>検索</span>
        </button>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ route: r, label, icon: Icon }) => (
            <button
              key={r}
              onClick={() => setRoute(r)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
                route === r
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-soft hover:bg-surface-sunken'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
              {r === 'inbox' && inboxCount > 0 && (
                <span className="ml-auto chip bg-accent text-white px-2 py-0.5">
                  {inboxCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => openNewCard()}
          className="btn-primary mt-6 py-3 text-[15px]"
        >
          <Plus size={18} /> カードを追加
        </button>

        <button
          onClick={openSettings}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-soft hover:bg-surface-sunken transition-colors"
        >
          <Database size={18} />
          <span>データ・バックアップ</span>
        </button>
        <div className="pt-3 text-xs text-ink-faint px-2 leading-relaxed">
          すべてこの端末に保存されます。<br />
          オフラインでも使えます。
        </div>
      </aside>

      {/* メイン */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* モバイル：上部ヘッダー */}
        <header className="sm:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-slate-100 px-4 py-3 pt-safe flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent text-white grid place-items-center">
            🧠
          </div>
          <span className="font-semibold">思考デスク</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={openSearch}
              className="btn-ghost h-10 w-10"
              aria-label="検索"
            >
              <Search size={21} />
            </button>
            <button
              onClick={openSettings}
              className="btn-ghost h-10 w-10"
              aria-label="データ・バックアップ"
            >
              <Database size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 sm:pb-12">
          {children}
        </main>
      </div>

      {/* モバイル：下部タブバー */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-slate-200 pb-safe">
        <div className="grid grid-cols-5">
          {NAV.map(({ route: r, label, icon: Icon }) => (
            <button
              key={r}
              onClick={() => setRoute(r)}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                route === r ? 'text-accent-ink' : 'text-ink-faint'
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
              {r === 'inbox' && inboxCount > 0 && (
                <span className="absolute top-1.5 right-1/2 translate-x-4 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[10px] grid place-items-center">
                  {inboxCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* モバイル：フローティング追加ボタン */}
      <button
        onClick={() => openNewCard()}
        className="sm:hidden fixed right-5 bottom-20 z-30 h-14 w-14 rounded-full bg-accent text-white shadow-lift grid place-items-center active:scale-95 transition-transform"
        aria-label="カードを追加"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
