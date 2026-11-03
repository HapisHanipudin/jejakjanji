'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export type Opsi = { value: string; label: string; disabled?: boolean };

/**
 * A native <select> with a themed listbox on fine pointers. The native element stays the form
 * value (GET forms, React onChange, form reset, no-JS); touch devices keep the OS picker.
 */
export function ThemedSelect({
  id,
  name,
  options,
  defaultValue,
  value,
  onChange,
  required,
  disabled,
  className,
  'aria-label': ariaLabel,
}: {
  id: string;
  name?: string;
  options: Opsi[];
  defaultValue?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}) {
  const select = useRef<HTMLSelectElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [enhanced, setEnhanced] = useState(false);
  const [current, setCurrent] = useState(value ?? defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<CSSProperties>({});
  const [labelId, setLabelId] = useState<string>();
  const typed = useRef({ text: '', at: 0 });

  const shown = value ?? current;
  const selected = options.find((o) => o.value === shown) ?? options[0];

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    setEnhanced(true);
    const el = select.current!;
    const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
    if (label) {
      label.id ||= `${id}-label`;
      setLabelId(label.id);
    }
    const sync = () => setCurrent(el.value);
    // Form reset restores defaults after the event fires, so read on the next tick.
    const onReset = () => setTimeout(sync, 0);
    el.addEventListener('change', sync);
    el.form?.addEventListener('reset', onReset);
    sync();
    return () => {
      el.removeEventListener('change', sync);
      el.form?.removeEventListener('reset', onReset);
    };
  }, [id]);

  // React applies defaultValue only on mount; carry later changes (filters read from the URL) to
  // the options so a parent's form.reset() lands on the new default instead of the first one.
  useEffect(() => {
    if (value !== undefined || !select.current) return;
    for (const o of Array.from(select.current.options))
      o.defaultSelected = o.value === (defaultValue ?? '');
  }, [defaultValue, value, options]);

  // Options can arrive after mount (tracker loads programs); keep the label in step.
  useEffect(() => {
    if (select.current) setCurrent(select.current.value);
  }, [options]);

  // Close when clicking elsewhere, scrolling, or resizing (the list is fixed-positioned in a portal).
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      const t = e.target as Node;
      if (e.type === 'pointerdown' && (wrap.current?.contains(t) || list.current?.contains(t)))
        return;
      if (e.type === 'scroll' && list.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    window.addEventListener('scroll', away, true);
    window.addEventListener('resize', away);
    list.current?.focus();
    return () => {
      document.removeEventListener('pointerdown', away);
      window.removeEventListener('scroll', away, true);
      window.removeEventListener('resize', away);
    };
  }, [open]);

  useEffect(() => {
    if (open)
      list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function buka() {
    if (disabled) return;
    const r = button.current!.getBoundingClientRect();
    const below = innerHeight - r.bottom;
    const up = below < 240 && r.top > below;
    setPos({
      left: Math.max(8, Math.min(r.left, innerWidth - Math.max(r.width, 224) - 8)),
      minWidth: r.width,
      maxWidth: `min(32rem, ${innerWidth - 16}px)`,
      ...(up ? { bottom: innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      maxHeight: Math.min(352, (up ? r.top : below) - 16),
    });
    setActive(Math.max(0, options.indexOf(selected!)));
    setOpen(true);
  }

  function tutup() {
    setOpen(false);
    button.current?.focus();
  }

  function pilih(i: number) {
    const o = options[i];
    if (!o || o.disabled) return;
    const el = select.current!;
    if (el.value !== o.value) {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, o.value);
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    tutup();
  }

  const langkah = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir)
      if (!options[i]!.disabled) return i;
    return from;
  };

  function onListKey(e: KeyboardEvent<HTMLUListElement>) {
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => langkah(a, 1)),
      ArrowUp: () => setActive((a) => langkah(a, -1)),
      Home: () => setActive(langkah(-1, 1)),
      End: () => setActive(langkah(options.length, -1)),
      Enter: () => pilih(active),
      ' ': () => pilih(active),
      Escape: () => tutup(),
    };
    // Hand focus back first so Tab continues from the field, not from the end of the page.
    if (e.key === 'Tab') return tutup();
    const k = keys[e.key];
    if (k) {
      e.preventDefault();
      k();
      return;
    }
    if (e.key.length === 1) {
      // Typeahead on the label or on its name after a leading code ("2.11 Lingkungan").
      const now = Date.now();
      typed.current = {
        text: (now - typed.current.at < 700 ? typed.current.text : '') + e.key.toLowerCase(),
        at: now,
      };
      const q = typed.current.text;
      const i = options.findIndex(
        (o) =>
          !o.disabled &&
          (o.label.toLowerCase().startsWith(q) ||
            o.label
              .toLowerCase()
              .replace(/^[\d.]+\s+/, '')
              .startsWith(q)),
      );
      if (i >= 0) setActive(i);
    }
  }

  return (
    <div className="select-field" ref={wrap} data-enhanced={enhanced || undefined}>
      <select
        ref={select}
        id={id}
        name={name}
        className={className}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-hidden={enhanced || undefined}
        tabIndex={enhanced ? -1 : undefined}
        onFocus={enhanced ? () => button.current?.focus() : undefined}
        {...(value !== undefined ? { value, onChange } : { defaultValue, onChange })}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {enhanced && (
        <button
          ref={button}
          type="button"
          className={`select-button${className?.includes('select-sm') ? ' select-button-sm' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={labelId ? `${labelId} ${id}-btn` : undefined}
          aria-label={labelId ? undefined : ariaLabel}
          id={`${id}-btn`}
          disabled={disabled}
          onClick={() => (open ? tutup() : buka())}
          onKeyDown={(e) => {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
              e.preventDefault();
              buka();
            }
          }}
        >
          <span className="select-button-text">{selected?.label}</span>
        </button>
      )}
      {open &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            className="select-list"
            style={pos}
            aria-labelledby={labelId}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onListKey}
          >
            {options.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                data-i={i}
                role="option"
                aria-selected={o.value === shown}
                aria-disabled={o.disabled || undefined}
                data-active={i === active || undefined}
                className="select-option"
                onPointerMove={() => !o.disabled && setActive(i)}
                onClick={() => pilih(i)}
              >
                <span className="select-check" aria-hidden="true">
                  {o.value === shown && <Icon name="check" />}
                </span>
                {o.label}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
