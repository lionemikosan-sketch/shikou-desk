import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Card } from '@/types';
import { TYPE_META, STATUS_META } from '@/lib/constants';

export interface CardNodeData {
  card: Card;
  [key: string]: unknown;
}

/** マインドマップ上のカードノード */
function CardNodeBase({ data, selected }: NodeProps) {
  const card = (data as CardNodeData).card;
  const type = TYPE_META[card.type];
  const status = STATUS_META[card.status];

  return (
    <div
      className={`w-44 rounded-2xl border-l-4 ${type.accent} bg-surface px-3 py-2.5
        shadow-soft border border-slate-100 transition-shadow ${
          selected ? 'ring-2 ring-accent shadow-lift' : 'hover:shadow-lift'
        }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !bg-slate-300 !border-2 !border-white"
      />
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm" aria-hidden>
          {type.emoji}
        </span>
        <span className="text-[10px] font-medium text-ink-faint">
          {type.label}
        </span>
        <span className={`ml-auto chip ${status.tint} !px-1.5 !py-0 !text-[10px]`}>
          {status.label}
        </span>
      </div>
      <p className="text-[13px] font-medium leading-snug break-words line-clamp-3">
        {card.title || '(無題)'}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !bg-accent !border-2 !border-white"
      />
    </div>
  );
}

export const CardNode = memo(CardNodeBase);
