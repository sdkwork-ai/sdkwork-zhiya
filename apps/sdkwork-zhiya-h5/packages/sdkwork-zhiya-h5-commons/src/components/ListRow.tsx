import type { ReactNode } from 'react';

import { cx } from '../utils/format.js';

export interface ListRowProps {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  onClick?: (() => void) | undefined;
}

export function ListRow({ leading, title, description, trailing, onClick }: ListRowProps) {
  const content = (
    <>
      {leading !== undefined ? <span className="shrink-0">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-primary">{title}</span>
        {description !== undefined && description !== null ? (
          <span className="mt-0.5 block truncate text-xs text-secondary">{description}</span>
        ) : null}
      </span>
      {trailing !== undefined ? <span className="shrink-0 text-xs text-secondary">{trailing}</span> : null}
    </>
  );
  if (onClick !== undefined) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-panel-muted"
      >
        {content}
      </button>
    );
  }
  return <div className="flex items-center gap-3 px-4 py-3">{content}</div>;
}

export function Card({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return (
    <div
      className={cx(
        'mx-4 overflow-hidden rounded-2xl border border-border-subtle bg-panel shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <h2 className="text-base font-semibold text-primary">{title}</h2>
      {action}
    </div>
  );
}
