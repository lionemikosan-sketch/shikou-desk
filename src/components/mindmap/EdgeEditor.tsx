import { useEffect, useState } from 'react';
import type { CardEdge, EdgeType } from '@/types';
import { EDGE_META, EDGE_TYPES } from '@/lib/constants';
import { Modal } from '@/components/common/Modal';

interface EdgeEditorProps {
  edge: CardEdge | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<CardEdge>) => void;
  onDelete: (id: string) => void;
}

/** 接続線の種類・ラベルを編集する */
export function EdgeEditor({ edge, onClose, onSave, onDelete }: EdgeEditorProps) {
  const [type, setType] = useState<EdgeType>('relation');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (edge) {
      setType(edge.type);
      setLabel(edge.label);
    }
  }, [edge]);

  return (
    <Modal
      open={edge !== null}
      onClose={onClose}
      title="接続線の編集"
      footer={
        <div className="flex items-center gap-3">
          <button
            className="btn-ghost px-4 py-2.5 text-rose-500 hover:bg-rose-50"
            onClick={() => {
              if (edge) onDelete(edge.id);
              onClose();
            }}
          >
            線を削除
          </button>
          <div className="flex-1" />
          <button
            className="btn-primary px-6 py-2.5"
            onClick={() => {
              if (edge) onSave(edge.id, { type, label: label.trim() });
              onClose();
            }}
          >
            保存
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-faint mb-2">
            関係の種類
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EDGE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                  type === t
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-slate-200 text-ink-soft hover:bg-surface-sunken'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: EDGE_META[t].color }}
                />
                {EDGE_META[t].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-faint mb-1.5">
            ラベル（任意）
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="線に表示する文字（空なら種類名）"
            className="input-base"
          />
        </div>
      </div>
    </Modal>
  );
}
