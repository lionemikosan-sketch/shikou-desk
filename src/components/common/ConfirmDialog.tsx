import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'キャンセル',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex gap-3 justify-end">
          <button className="btn-outline px-5 py-2.5" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={
              destructive
                ? 'btn px-5 py-2.5 bg-rose-500 text-white hover:bg-rose-600'
                : 'btn-primary px-5 py-2.5'
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      {message && <p className="text-sm text-ink-soft leading-relaxed">{message}</p>}
    </Modal>
  );
}
