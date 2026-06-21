import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  count?: number;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, count, icon, action, children }: SectionProps) {
  return (
    <section className="mt-7">
      <div className="flex items-center gap-2 mb-3 px-1">
        {icon && <span className="text-ink-soft">{icon}</span>}
        <h2 className="font-semibold text-ink">{title}</h2>
        {typeof count === 'number' && (
          <span className="chip bg-surface-sunken text-ink-faint">{count}</span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}
