import { useEffect, useMemo, useState } from 'react';
import { Trash2, Copy, Plus, ListTree, CornerUpLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import type { CardStatus, CardType, Priority } from '@/types';
import {
  CARD_TYPES,
  PRIORITIES,
  PRIORITY_META,
  STATUS_META,
  KANBAN_ORDER,
  TYPE_META,
} from '@/lib/constants';
import { childrenOf, collectTags } from '@/lib/cards';
import { Modal } from './common/Modal';
import { ConfirmDialog } from './common/ConfirmDialog';
import { TagInput } from './common/TagInput';

interface FormState {
  title: string;
  body: string;
  type: CardType;
  status: CardStatus;
  priority: Priority;
  dueDate: string;
  tags: string[];
}

const emptyForm: FormState = {
  title: '',
  body: '',
  type: 'memo',
  status: 'inbox',
  priority: 'medium',
  dueDate: '',
  tags: [],
};

/** カードの新規作成・編集モーダル（アプリ全体で1つ） */
export function CardEditor() {
  const { editorOpen, editingCard, editorSeed, closeEditor, openEditCard, openNewCard } =
    useUI();
  const addCard = useStore((s) => s.addCard);
  const updateCard = useStore((s) => s.updateCard);
  const deleteCard = useStore((s) => s.deleteCard);
  const duplicateCard = useStore((s) => s.duplicateCard);
  const allCards = useStore((s) => s.cards);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tagSuggestions = useMemo(
    () => collectTags(allCards).map((t) => t.tag),
    [allCards],
  );

  const children = useMemo(
    () => (editingCard ? childrenOf(allCards, editingCard.id) : []),
    [allCards, editingCard],
  );
  const parent = useMemo(
    () =>
      editingCard?.parentId
        ? allCards.find((c) => c.id === editingCard.parentId) ?? null
        : null,
    [allCards, editingCard],
  );

  // モーダルが開くたびにフォームを初期化する
  useEffect(() => {
    if (!editorOpen) return;
    if (editingCard) {
      setForm({
        title: editingCard.title,
        body: editingCard.body,
        type: editingCard.type,
        status: editingCard.status,
        priority: editingCard.priority,
        dueDate: editingCard.dueDate ?? '',
        tags: editingCard.tags,
      });
    } else {
      setForm({
        ...emptyForm,
        ...editorSeed,
        dueDate: editorSeed?.dueDate ?? '',
        tags: editorSeed?.tags ?? [],
      });
    }
  }, [editorOpen, editingCard, editorSeed]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSave = form.title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const payload = {
      title: form.title.trim(),
      body: form.body,
      type: form.type,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      tags: form.tags,
    };
    if (editingCard) {
      updateCard(editingCard.id, payload);
    } else {
      addCard(payload);
    }
    closeEditor();
  };

  const handleDelete = () => {
    if (editingCard) deleteCard(editingCard.id);
    setConfirmDelete(false);
    closeEditor();
  };

  const handleDuplicate = () => {
    if (!editingCard) return;
    const copy = duplicateCard(editingCard.id);
    if (copy) openEditCard(copy);
  };

  const handleAddChild = () => {
    if (!editingCard) return;
    openNewCard({
      title: '',
      parentId: editingCard.id,
      status: editingCard.status,
      type: 'todo',
    });
  };

  return (
    <>
      <Modal
        open={editorOpen}
        onClose={closeEditor}
        size="lg"
        title={editingCard ? 'カードを編集' : '新しいカード'}
        footer={
          <div className="flex items-center gap-3">
            {editingCard && (
              <>
                <button
                  className="btn-ghost h-11 w-11 text-rose-500 hover:bg-rose-50"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="削除"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  className="btn-ghost h-11 w-11"
                  onClick={handleDuplicate}
                  aria-label="複製"
                  title="複製"
                >
                  <Copy size={19} />
                </button>
              </>
            )}
            <div className="flex-1" />
            <button className="btn-outline px-5 py-2.5" onClick={closeEditor}>
              キャンセル
            </button>
            <button
              className="btn-primary px-6 py-2.5"
              onClick={handleSave}
              disabled={!canSave}
            >
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {parent && (
            <button
              onClick={() => openEditCard(parent)}
              className="flex items-center gap-1.5 text-xs text-ink-soft bg-surface-sunken rounded-lg px-2.5 py-1.5 hover:bg-slate-200 transition w-full text-left"
            >
              <CornerUpLeft size={13} className="shrink-0" />
              <span className="text-ink-faint">親カード:</span>
              <span className="font-medium truncate">
                {parent.title || '(無題)'}
              </span>
            </button>
          )}
          <div>
            <label className="block text-xs font-medium text-ink-faint mb-1.5">
              タイトル
            </label>
            <input
              autoFocus={!editingCard}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="ひとことで言うと？"
              className="input-base text-[15px]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-faint mb-1.5">
              内容・メモ
            </label>
            <textarea
              value={form.body}
              onChange={(e) => update('body', e.target.value)}
              placeholder="詳しい内容、思いついたこと、考えたことを自由に…"
              rows={7}
              className="input-base resize-y leading-relaxed text-[15px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-faint mb-1.5">
                種類
              </label>
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value as CardType)}
                className="input-base appearance-none"
              >
                {CARD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].emoji} {TYPE_META[t].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-faint mb-1.5">
                ステータス
              </label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as CardStatus)}
                className="input-base appearance-none"
              >
                {KANBAN_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-faint mb-1.5">
                優先度
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  update('priority', e.target.value as Priority)
                }
                className="input-base appearance-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-faint mb-1.5">
                期限
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => update('dueDate', e.target.value)}
                className="input-base appearance-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-faint mb-1.5">
              タグ
            </label>
            <TagInput
              tags={form.tags}
              onChange={(tags) => update('tags', tags)}
              suggestions={tagSuggestions}
            />
          </div>

          {editingCard && (
            <div className="pt-1">
              <div className="flex items-center gap-1.5 mb-2">
                <ListTree size={15} className="text-ink-soft" />
                <label className="text-xs font-medium text-ink-faint">
                  サブタスク（子カード）
                </label>
                {children.length > 0 && (
                  <span className="chip bg-surface-sunken text-ink-faint">
                    {children.length}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openEditCard(c)}
                    className="w-full flex items-center gap-2 text-left rounded-xl border border-slate-100 bg-surface px-3 py-2 hover:bg-surface-sunken transition"
                  >
                    <span aria-hidden>{TYPE_META[c.type].emoji}</span>
                    <span className="text-sm truncate flex-1">
                      {c.title || '(無題)'}
                    </span>
                    <span className={`chip ${STATUS_META[c.status].tint}`}>
                      {STATUS_META[c.status].label}
                    </span>
                  </button>
                ))}
                <button
                  onClick={handleAddChild}
                  className="btn-outline w-full py-2.5 text-sm"
                >
                  <Plus size={16} /> 子カードを追加
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="このカードを削除しますか？"
        message="削除すると元に戻せません。接続線も一緒に削除されます。"
        confirmLabel="削除する"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
