import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useUI } from './store/useUI';
import { AppShell } from './components/layout/AppShell';
import { CardEditor } from './components/CardEditor';
import { SearchOverlay } from './components/SearchOverlay';
import { SettingsOverlay } from './components/SettingsOverlay';
import { HomePage } from './pages/HomePage';
import { InboxPage } from './pages/InboxPage';
import { KanbanPage } from './pages/KanbanPage';
import { MindmapPage } from './pages/MindmapPage';
import { TemplatesPage } from './pages/TemplatesPage';

export default function App() {
  const init = useStore((s) => s.init);
  const loaded = useStore((s) => s.loaded);
  const error = useStore((s) => s.error);
  const route = useUI((s) => s.route);

  useEffect(() => {
    init();
  }, [init]);

  if (!loaded) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface-muted">
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-ink-soft font-medium">思考デスクを開いています…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppShell>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 text-rose-600 text-sm px-4 py-3">
            {error}
          </div>
        )}
        {route === 'home' && <HomePage />}
        {route === 'inbox' && <InboxPage />}
        {route === 'kanban' && <KanbanPage />}
        {route === 'mindmap' && <MindmapPage />}
        {route === 'templates' && <TemplatesPage />}
      </AppShell>

      {/* グローバルなオーバーレイ群 */}
      <CardEditor />
      <SearchOverlay />
      <SettingsOverlay />
    </>
  );
}
