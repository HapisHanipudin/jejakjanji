'use client';

import { useEffect, useRef, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export function ProgramFilter({
  action,
  filterKey,
  children,
}: {
  action: string;
  filterKey: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  // Restore URL-derived defaults on Back/Forward without replacing the focused form.
  useEffect(() => form.current?.reset(), [filterKey]);

  return (
    <form
      ref={form}
      method="get"
      action={action}
      className="box form-row program-filter"
      style={{ padding: 'var(--space-5)' }}
      role="search"
      aria-label="Saring program"
      aria-busy={pending}
      data-pending={pending}
      onSubmit={(event) => {
        event.preventDefault();
        const url = new URL(event.currentTarget.action);
        for (const [name, value] of new FormData(event.currentTarget)) {
          if (typeof value === 'string') url.searchParams.append(name, value);
        }
        startTransition(() => router.push(url.pathname + url.search, { scroll: false }));
      }}
    >
      {children}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Memuat hasil…' : 'Terapkan'}
      </button>
      <span className="sr-only" role="status">
        {pending ? 'Memuat hasil filter.' : ''}
      </span>
    </form>
  );
}
