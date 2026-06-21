import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** フッター（ボタン類など） */
  footer?: ReactNode;
  /** 幅 */
  size?: 'md' | 'lg';
}

/** 中央モーダル。スマホでは下からのシート風に近い大きめ表示。 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxW} max-h-[92vh] flex flex-col bg-surface
          rounded-t-3xl sm:rounded-3xl shadow-lift animate-pop-in`}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              className="btn-ghost h-9 w-9 -mr-1"
              onClick={onClose}
              aria-label="閉じる"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4 grow">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-slate-100 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
