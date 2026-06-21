import { useRef, useState } from 'react';
import { Download, Upload, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { exportBackup, parseBackup } from '@/lib/backup';
import { Modal } from './common/Modal';
import { ConfirmDialog } from './common/ConfirmDialog';

/** データのバックアップ（JSON出力・読み込み）と保存状況 */
export function SettingsOverlay() {
  const open = useUI((s) => s.settingsOpen);
  const close = useUI((s) => s.closeSettings);
  const cards = useStore((s) => s.cards);
  const edges = useStore((s) => s.edges);
  const importData = useStore((s) => s.importData);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ cards: number; edges: number; run: () => void } | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const handleExport = () => {
    exportBackup(cards, edges);
    setMessage({ kind: 'ok', text: 'バックアップを書き出しました。' });
  };

  const handleFile = async (file: File) => {
    setMessage(null);
    try {
      const text = await file.text();
      const parsed = parseBackup(text);
      setPending({
        cards: parsed.cards.length,
        edges: parsed.edges.length,
        run: async () => {
          await importData(parsed.cards, parsed.edges);
          setMessage({
            kind: 'ok',
            text: `読み込み完了：カード${parsed.cards.length}件・接続線${parsed.edges.length}件`,
          });
        },
      });
    } catch (e) {
      setMessage({
        kind: 'err',
        text: e instanceof Error ? e.message : '読み込みに失敗しました。',
      });
    }
  };

  return (
    <>
      <Modal open={open} onClose={close} title="データ・バックアップ">
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface-sunken p-4 flex items-center gap-3">
            <Database size={22} className="text-accent-ink shrink-0" />
            <div className="text-sm">
              <p className="font-medium">この端末に保存中</p>
              <p className="text-ink-faint">
                カード {cards.length} 件 ・ 接続線 {edges.length} 件
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="btn-outline w-full py-3 justify-start px-4 text-[15px]"
            >
              <Download size={19} className="text-accent-ink" />
              <span className="font-medium">JSONバックアップを書き出す</span>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-outline w-full py-3 justify-start px-4 text-[15px]"
            >
              <Upload size={19} className="text-accent-ink" />
              <span className="font-medium">JSONバックアップを読み込む</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
            />
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 text-sm rounded-xl p-3 ${
                message.kind === 'ok'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {message.kind === 'ok' ? (
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <p className="text-xs text-ink-faint leading-relaxed">
            データはすべてこの端末（ブラウザ）に保存されます。機種変更や別端末への移行のときは、
            JSONを書き出して、移行先で読み込んでください。読み込むと現在のデータは置き換わります。
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={pending !== null}
        title="バックアップを読み込みますか？"
        message={`現在のデータは、読み込むデータ（カード${pending?.cards ?? 0}件・接続線${pending?.edges ?? 0}件）で置き換わります。先に書き出しておくことをおすすめします。`}
        confirmLabel="読み込む"
        destructive
        onConfirm={() => {
          pending?.run();
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
